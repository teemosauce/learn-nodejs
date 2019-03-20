
var Log = require('../log')
/**
 * 空函数
 */
function noop() {}

/**
 * 定义一个创建类带继承的方法
 */
var Class = {
    create: function () {

        // 定义要创建的类
        function Fun() {
            // 构造函数中默认执行initialize函数 类似于自定义的构造函数
            this.initialize.apply(this, arguments)
        }

        // 获取创建该类传递的参数列表并直接转换成数组
        var args = Array.prototype.slice.apply(arguments)

        // 取出第一个参数 如果第一个参数是function 代表有父类需要继承
        if (typeof args[0] === 'function') {
            // 有父类取出来
            var Parent = args.shift();

            // 重新定义一个局部类 指向该父类的原型
            function FunParent() {}
            FunParent.prototype = Parent.prototype

            // 将子类的原型指向父类的实例 这样子类就拥有和父类一样的属性和方法
            Fun.prototype = new FunParent()
        }

        /**
         * 将其他参数全部转成一个对象 因为可能传递多个对象 将最终对象上的方法全部复制到原型上面
         */
        var custom = Object.assign.apply(Object, arguments);
        for (var key in custom) {
            Fun.prototype[key] = custom[key]
        }

        // 重新包装一下initialize 方法 让该方法的只能执行一次
        var initialize = Fun.prototype.initialize || noop
        Fun.prototype.initialize = function () {
            if (!this.initialized) {
                initialize.apply(this, arguments);
                this.initialized = true;
                Log.m("初次实例化", arguments)
            } else {
                Log.m("实例化函数只能执行一次")
            }
        }
        return Fun
    }
}

/**
 * 【父类】 汽车类Car
 */
var Car = Class.create({

    // 公共属性 所有实例共享
    publicRef: {
        author: 'lyp',
        items: ['a']
    },

    initialize(color) {
        /**
         * 私有属性必须放在initialize里面定义
         */
        this.privateRef = {
            date: Date.now()
        }
        this.color = color;
    },
    setColor(color) {
        this.color = color;
    },
    getColor() {
        return this.color
    },

    /**
     * 用来测试全局变量污染
     */
    addItem(item) {
        this.publicRef.items.push(item)
    },

    getItems() {
        return this.publicRef.items
    }
})

/**
 * 【子类】出租车类Taxi --> 继承汽车Car
 */
var Taxi = Class.create(Car, {
    initialize(color, no) {
        this.no = no;
        this.color = color;
    },
    setNo(no) {
        this.sex = no;
    },
    getNo() {
        return this.no
    }
})
var car1 = new Car("红色");
Log.m("这是一辆汽车car1", car1.getColor())
var car2 = new Car("绿色");
Log.m("这是一辆汽车car2", car2.getColor())

car1.addItem("b")
car1.addItem("c")

/** car2 并没有添加Item 但是却能取到和car1一样的结果 */
Log.m("car1 items:", car1.getItems())
Log.m("car2 items:", car2.getItems())


var taxi1 = new Taxi("黑色", "京B04583")

Log.m("这是一辆出租车", taxi1.getColor() + taxi1.getNo())