import { inject, reactive } from 'vue'


export function forEachValue(obj, fn) {
    Object.keys(obj).forEach(key => {
        fn(obj[key], key)
    })

}
// forEachValue({a:1,b:2},function(value,key){ 
//     console.log(value,key);

//     // 在每个函数拿到对象的key/value
//  })



let storeKey = 'store'  // 给store默认名字
class Store {
    constructor(options) {
        // this.a = 1000 // 这个值在模板里有,但是在setup里却没有. 转成render函数,会去上下文里找函数

        /// vuex3 内部是创造一个vue的实例,但是vuex4是采用vue3提供的响应式方法(可能是monorepo初见效果,单独使用响应式)
        let store = this; // 保存一下this,后面会用到



        // store._state.data 就可以直接拿到state了
        store._state = reactive({ // 以前是new vue,现在reactive就可以了
            data: options.state, // 多加一层data...是有原因的=> 为了replaceState的时候不是替换整个reactive,而只是替换一个属性data
        })

        let _getters = options.getters
        store.getters = {}
        forEachValue(_getters, function (fn, key) {
            Object.defineProperty(store.getters, key, {
                get: () => fn(store.state), // 如果函数没改变,也是直接取值,是有函数性能的. => 目前没使用computed,3.1没使用. 但是3.2会使用 . 特意去看了vuex的源码, =>computedCache[key].value

            })
        })

        store._mutations = Object.create(null); // 这个方法创建的对象可以指定原型链,但是如果是null就是对象是没有原型链的
        store._actions = Object.create(null); // 这个方法创建的对象可以指定原型链,但是如果是null就是对象是没有原型链的
        let _mutations = options.mutations; // options里的_mutations是传递进来的_mutations
        let _actions = options.actions; // options里的_mutations是传递进来的_mutations
        console.log(_mutations);
        console.log(_actions);

        // mutation和action就是发布订阅,从对象里找到函数,执行即可
        forEachValue(_mutations, (mutation, key) => {
            store._mutations[key] = (payload) => { // 这里是循环把mutation存储起来
                mutation.call(store, store.state, payload) // 调用的时候传递state和payload
            }
        })
        forEachValue(_actions, (action, key) => { // *******这块看下异步是如何解决的,老师说异步不异步是用户决定的,我理解是里面的函数是立刻执行,等到Promise.all执行完成后统一执行吗?*************
            store._actions[key] = (payload) => {
                action.call(store, store, payload) // 第一个是绑定this, 第二个是传入给actions可以用的值
            }
        })

        console.log(store);
        console.log(store.state);
        console.log(options);
        // vuex 里面有个比较重要的api   => replaceState :官网解释=>替换 store 的根状态，仅用状态合并或时光旅行调试。 
    }

    // vuex就是一个发布订阅,前面每次都是挂载,等到commit和dispatch的时候是去对象里找到对应值后去轮训派发
    commit = (type, payload) => { // 必须要用箭头函数,因为用户那边是使用解构的方式.如果是箭头函数,那么this就是指向函数声明时所在作用域的this,而要是普通函数就是解构区域的this,可能就有问题.
        this._mutations[type](payload)

    }
    dispatch = (type, payload) => {// 必须要用箭头函数,因为用户那边是使用解构的方式.如果是箭头函数,那么this就是指向函数声明时所在作用域的this,而要是普通函数就是解构区域的this,可能就有问题.
        this._actions[type](payload)
    }




    // 每次访问state都是使用属性拦截器访问的_state.data
    get state() {
        return this._state.data;
    }



    install(app, injectKey) { // use的时候会触发这个install方法, createApp().use(store,'my命名空间')
        // console.log(app);
        // console.log(injectKey);

        // 全局暴露一个变量,暴露的是store的实例
        app.provide(injectKey || storeKey, this) // 可以不用app.provide,使用provide() ,因为也可以从vue里解构出来

        app.config.globalProperties.$store = this; // => Vue.prototype.$store 就是把实例放到了全局上. ****这样的话就不会有命名空间了****
    }
}









// 创建容器,返回一个store,而且可以多次创造. 创建多个store返回的是哪个store呢?  可以给store不同的名字,这样使用的时候就要区分名字了
export function createStore(options) {
    // console.log(options);
    return new Store(options)
}


// vue内部已经将这些api导出,所以直接引入inject方法
export function useStore(injectKey = storeKey) { // 因为创建的时候,可以创建多个,所以使用的时候命名后需要使用名字
    // 使用的时候如果不命名,肯定是undefined. 
    console.log(injectKey);
    return inject(injectKey) // 就是vue3的inject

}



