PENDING = "PENDING";
FULFILLED = "FULFILLED";
REJECTED = "REJECTED";

/**
 * 把一个任务放到微任务队列
 * @param {function} task 任务
 */
function runMicroTask(task) {
  if (process && process.nextTick) {
    // node 环境
    process.nextTick(task);
  } else if (MutationObserver) {
    // 支持MutationObserver的浏览器环境
    let node = document.createElement("div");
    let observer = new MutationObserver(task);
    observer.observe(node, {
      childList: true,
    });
    node.innerText = "1";
  } else {
    // 其它情况下
    setTimeout(task, 0);
  }
}

/**
 * 判断一个对象是不是promise
 * @param {Object} obj
 * @returns
 */
function isPromise(obj) {
  return !!(obj && typeof obj.then == "function");
}

class MyPromise {
  /**
   * 构造函数
   * @param {function} executor 任务
   */
  constructor(executor) {
    this._state = PENDING;
    this._value = undefined;
    this._handlers = [];
    executor(this._resolve.bind(this), this._reject.bind(this));
  }

  _resolve(value) {
    this.changeState(FULFILLED, value);
  }

  _reject(err) {
    this.changeState(REJECTED, err);
  }

  /**
   * 改变状态
   * @param {String} state
   * @param {Any} value
   * @returns
   */
  changeState(state, value) {
    if (state == PENDING) {
      return;
    }
    this._state = state;
    this._value = value;

    this._runHandlers();
  }

  then(onFulfilled, onRejected) {
    return new MyPromise((resolve, reject) => {
      this._pushHandler(FULFILLED, onFulfilled, resolve, reject);
      this._pushHandler(REJECTED, onRejected, resolve, reject);

      this._runHandlers();
    });
  }

  _pushHandler(state, executor, resolve, reject) {
    this._handlers.push({
      state,
      executor,
      resolve,
      reject,
    });
  }

  _runHandlers() {
    if (this._state == PENDING) {
      return;
    }
    while (this._handlers[0]) {
      let handler = this._handlers[0];
      this._runHandler(handler);
      this._handlers.shift();
    }
  }

  _runHandler({ state, executor, resolve, reject }) {
    runMicroTask(() => {
      if (state == this._state) {
        try {
          let result = executor(this._value);
          if (isPromise(result)) {
            result.then(resolve, reject);
          } else {
            this._state == FULFILLED ? resolve(result) : reject(result);
          }
        } catch (err) {
          reject(err);
        }
      }
    });
  }
}

MyPromise.resolve = (value) => {
  return new MyPromise((resolve) => {
    resolve(value);
  });
};

MyPromise.reject = (err) => {
  return new MyPromise((resolve, reject) => {
    reject(err);
  });
};

MyPromise.all = (promises) => {
  return new MyPromise((resolve, reject) => {
    let results = [];

    let done = 0;
    let promisesLength = promises.length;
    function allDone(index, result) {
      results[index] = result;
      done++;
      console.log(done, promisesLength);
      if (done == promisesLength) {
        resolve(results);
      }
    }

    for (let i = 0, len = promises.length; i < len; i++) {
      let promise = promises[i];
      if (!isPromise(promise)) {
        promise = Promise.resolve(promise);
      }
      promise.then((result) => {
        allDone(i, result);
      }, reject);
    }
  });
};

p = new MyPromise((resolve, reject) => {
  setTimeout(() => {
    // reject("登录失败");
    resolve("登录成功");
  }, 1000);
});

let p1 = p
  .then(
    function A1(result) {
      let promise = new MyPromise((resolve, reject) => {
        setTimeout(() => {
          console.log("获取数据成功");
          reject("数据");
        }, 2000);
      });
      return promise;
    },
    function A2(err) {
      console.log("A2" + err);
    }
  )
  .then(
    function A3(result) {
      console.log("渲染成功" + result);
    },
    function A4(err) {
      console.log("渲染失败" + err);
    }
  );

p.then(
  function B1(result) {
    console.log("B" + result);
  },
  function B2(err) {
    console.log("B2" + err);
  }
);

// setTimeout(() => {
//   console.log(p);
// }, 3000);

let pa = new Promise((resolve, reject) => {
  let n = 0;
  let interval = setInterval(() => {
    if (n == 5) {
      clearInterval(interval);
      reject("PA打印完成");
    }
    console.log("PA每秒打印一次");
    n++;
  }, 1000);
});

let pb = new Promise((resolve) => {
  let n = 0;
  let interval = setInterval(() => {
    if (n == 20) {
      clearInterval(interval);
      resolve("PB打印完成");
    }
    console.log("PB每秒打印二次");
    n++;
  }, 500);
});

MyPromise.all([pa, pb]).then(
  (result) => {
    console.log(result);
  },
  (err) => {
    console.log("错误", err);
  }
);
