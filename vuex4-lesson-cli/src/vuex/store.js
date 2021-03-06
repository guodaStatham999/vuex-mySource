import {
    isPromise,
    forEachValue
} from './utils'
import {
    reactive,
    watch
} from 'vue';
import ModuleCollection from './module/module-collection.js'







function getNestedState(state, path) { // 根据路径,获取store上面的最新状态
    return path.reduce((state, key) => state[key], state)
}









// ---事后总结: 
// install(a)
// a,b先安装,安装a的时候有c就安装c了
// install(b)
// 第一个参数: 给谁安装,给store 第二个参数: 安装什么,安装state 第三个参数: 怎么记录? 用[]记录父子关系的路径 第四个参数: 从水开始? 从根目录开始
function installModule(store, rootState, path, module) { // 安装也是递归安装

    // ***感觉就是在每个人的state里循环把每个人的自己和孩子的状态都加上***

    let isRoot = !path.length; // 如果是空数组,说明是根

    let nameSpaced = store._modules.getNamespaced(path); // [a,c] 如果当前是c,就取出来a是否有命名空间


    if (!isRoot) {   
        // 依旧是刚才的思路,其实就是一个数组取最后一个人参数作为父亲,如果是只有一个参数,就会被截取掉,然后使用默认值,再后面会给父亲的children重新赋值.
        let pathSlice = path.slice(0, -1)
        let parentState = pathSlice.reduce((state, key) => {
            console.log(state[key]);
            return state[key]
        }, rootState)

        store._withCommit(() => {
            let parentPath = path[path.length - 1]
            parentState[parentPath] = module.state; // 状态从新赋值-从父级.当前路径(也就是自己) 

        })
    }


    // **下面是挂载处理,相当于把每个人的getter/mutation/action及自己孩子的getter/mutation/action都循环挂载在自己的身上**

    // getters处理  => 取到getters
    module.forEachGetter((getter, key) => { // forEachGetter就是原型上的forEachChild改编的?
        store._wrappedGetters[nameSpaced + key] = () => {
            return getter(getNestedState(store.state, path)) // module.state不能直接使用这个值,因为是死值,不是响应式的值.  使用一个函数,每次都获取最新的值
        }
    })

    // mutation处理
    module.forEachMutation((mutation, key) => {
        let entry = store._mutations[nameSpaced + key] || (store._mutations[nameSpaced + key] = []) // 发布订阅,有就用,没有就是个数组
        entry.push((payload) => { // store.commit('add',payload) 用户会这么调用这个方法
            mutation.call(store, getNestedState(store.state, path), payload)
        })
    })

    // ***action和mutation有区别*** action执行后,会返回一个promise. 因为调用一般都是async fn  
    // action处理
    module.forEachAction((action, key) => {
        let entry = store._actions[nameSpaced + key] || (store._actions[nameSpaced + key] = []) // 发布订阅,有就用,没有就是个数组
        entry.push((payload) => { // store.dispatch('add',payload) 用户会这么调用这个方法
            let res = action.call(store, store, payload)

            // res是不是promise,需要区别对待
            if (!isPromise(res)) { // 不是promise,给包裹一层promise
                return Promise.resolve(res)
            }
            return res
        })
    })


    module.forEachChild((child, key) => { // key就是 aCount,bCount这个路径
        // 深度遍历: 循环当前模块的孩子,遇到孩子继续遍历他的孩子
        installModule(store, rootState, path.concat(key), child)
    })
}




function resetStoreState(store, state) {

    store._state = reactive({
        data: state // 为了后面替换方便,包一层对象
    })
    let wrappedGetters = store._wrappedGetters;
    store.getters = {};
    forEachValue(wrappedGetters, (getter, key) => {
        Object.defineProperty(store.getters, key, {
            get: getter,
            enumerable: true // 可枚举,是可以看到.
        })
    })

    if (store.strict) { // 如果是严格模式,就开启严格模式
        enableStrictMode(store)
    }
}


function enableStrictMode(store) {
    watch(() => store._state.data, () => {
        // 监控store._state.data数据变化,变化后执行第二个函数
        // watch默认监控一层,需要修改参数. watch是异步监控,需要修改参数改为同步
        console.assert(store._commiting, 'do not mutate vuex store state outside mutation handlers-不能在mutate之外修改属性')

    }, {
        deep: true,
        flush: 'sync' // 默认是异步,可以改成同步.  可以做深度监控-默认浅层因为浪费性能
    })
}




export default class Store {
    // 第一步数据格式化
    // 第二步安装,把他们存在我们需要的变量上 
    // 第三步 给容器添加对应的状态
    _withCommit(fn) { // 切片
        let commiting = this._commiting; // 老师告诉的逻辑: 执行前是true,执行完后变为false.  源码里的逻辑是可以实现这个功能,但是还可以实现别的功能.
        this._commiting = true;
        fn();
        this._commiting = commiting;
    }
    constructor(options) {
        console.log(this);
        let store = this;
        // { state,getter,mutations,actions,modules }
        store._modules = new ModuleCollection(options); // 格式化为一个树
        
        // {add:[fn,fn,多个方法]} 发布订阅模式,等到执行的时候找到属性名去循环执行
        store._wrappedGetters = Object.create(null)
        store._mutations = Object.create(null)
        store._actions = Object.create(null)

        this.strict = options.strict || false; // 表示是不是严格模式
        this._commiting = false; // 默认提交是false,只有正在提交的时候才是提交
        // 调用mutation的时候,要写同步代码 这个是前提
        // 在mutation调用之前标识一个状态 _commiting = true
        // 开始调用mutation =>  调用过程中,我就监控这个状态,如果当前这个状态变化的时候,这个commiting是true说明是同步更改的. 但是调用过程中已经变为false,说明同步代码已经结束了,目前处理异步流程,就抛错,说明有问题.
        // 调用结束后,改为false.




        let state = store._modules.root.state; // 根状态
        // 定义状态---模块的安装
        // 里面把store._modules.root的每一层的state都摘出来,放到store._modules.root.state里
        installModule(store, state, [], store._modules.root) // 总思路: 给store添加状态,先找到根状态,然后一层一层的插入 第一个参数: 后期修改的参数都会定义到store里 第二个参数,根目录状态,会添加到第一个参数里 第三个参数: 用来递归的数组,记录父子关系 第四个参数: 开始递归的起点


        // 定义响应式数据
        resetStoreState(store, state);




        store._subscribes = [] // store自身上定义一个属性,用来做发布订阅的数组
        // 等待store所有状态都创建完毕后,再创建插件,不然插件拿到的都是空数据.
        // 所以插件在最后
        options.plugins.forEach(plugin => plugin(store))
    }

    subscribe(fn) {
        this._subscribes.push(fn) // 往订阅的数组里放入方法
    }
    get state() {
        return this._state.data
    }

    replaceState(newData) {
        // 特殊情况下,是不能直接修改状态,会报错. 所以要使用_withCommit包裹一下

        this._withCommit(() => {
            this._state.data = newData; // 因为前面配置响应式的时候,包裹的是{data},所以此处修改对象里的data属性就可以
        })
    }

    commit = (type, payload) => {
        console.log(this);
        let entry = this._mutations[type] || [];
        this._withCommit(() => { // 相当于修改了commiting这个参数为true,执行完后变为false.
            entry.forEach(handler => handler(payload))
        })


        // 这个是插件部分,每次修改数据完成后,都要做通知操作
        this._subscribes.forEach(sub => sub({
            type,
            payload
        }, this.state))
    }
    dispatch = (type, payload) => {
        let entry = this._actions[type] || [] // entry可能是多个
        return Promise.all(entry.map(handler => handler(payload))) // 等待promise完成
    }
    install(app, injectKey) {
        app.provide(injectKey || storeKey, this) // 可以不用app.provide,使用provide() ,因为也可以从vue里解构出来
        app.config.globalProperties.$store = this; // => Vue.prototype.$store 就是把实例放到了全局上. ****这样的话就不会有命名空间了****
    }
    registerModule(path, rawModule) {
        if (typeof path === 'string') path = [path]
        let store = this;
        // 要在原有的模块上,新增加一个
        let newModule = store._modules.register(rawModule, path) // 把模块注册到父级上面
        // 把模块安装上



        installModule(store, store.state, path, newModule)


        // 重置状态
        resetStoreState(store, store.state);
    }
}


// 格式化用户参数,根据需要,后续使用方便

// root = {
//     _raw: rootModule, // 这是所有的原来数据
//     state: rootModule.state,
//     _children:{
//         aCount:{
//             _raw: aModule,
//             state:aModuleState,
//             _children:{}
//         },
//         bCount:{
//             _raw: bModule,
//             state:bModuleState,
//             _children:{}
//         },
//     }
// }