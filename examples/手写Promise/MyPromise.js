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

    let time = 0;
    let promisesLength = promises.length;
    function allDone(index, result) {
      results[index] = result;
      time++;
      if (time == promisesLength) {
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

MyPromise.race = (promises) => {
  return new Promise((resolve, reject) => {
    for (let i = 0, len = promises.length; i < len; i++) {
      let promise = promises[i];
      if (!isPromise(promise)) {
        promise = Promise.resolve(promise);
      }
      promise.then(resolve, reject);
    }
  });
};

let pa = new Promise((resolve, reject) => {
  let n = 0;
  let interval = setInterval(() => {
    if (n == 5) {
      clearInterval(interval);
      resolve("PA任务完成");
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
      resolve("PB任务完成");
    }
    console.log("PB每秒打印二次");
    n++;
  }, 500);
});

// MyPromise.all([pa, pb]).then(
//   (result) => {
//     console.log("所有任务完成", result);
//   },
//   (err) => {
//     console.log("有任务出现错误", err);
//   }
// );

MyPromise.race([pa, pb]).then(
  (result) => {
    console.log("有任务完成", result);
  },
  (err) => {
    console.log("有任务失败", err);
  }
);
