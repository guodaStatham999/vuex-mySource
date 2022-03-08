import {
    isPromise,
    forEachValue
} from './utils'
import {
    reactive
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

    if (!isRoot) {
        // 依旧是刚才的思路,其实就是一个数组取最后一个人参数作为父亲,如果是只有一个参数,就会被截取掉,然后使用默认值,再后面会给父亲的children重新赋值.
        let pathSlice = path.slice(0, -1)
        let parentState = pathSlice.reduce((state, key) => state[key], rootState)
        parentState[path[path.length - 1]] = module.state; // 把父级的[path[path.length-1]](没读懂,需要debugger一下) 从新复制
    }



    // getters处理  => 取到getters
    module.forEachGetter((getter, key) => { // forEachGetter就是原型上的forEachChild改编的?
        store._wrappedGetters[key] = () => {
            return getter(getNestedState(store.state, path)) // module.state不能直接使用这个值,因为是死值,不是响应式的值.  使用一个函数,每次都获取最新的值
        }
    })

    // mutation处理
    module.forEachMutation((mutation, key) => {
        let entry = store._mutations[key] || (store._mutations[key] = []) // 发布订阅,有就用,没有就是个数组
        entry.push((payload) => { // store.commit('add',payload) 用户会这么调用这个方法
            mutation.call(store, getNestedState(store.state, path), payload)
        })
    })

    // ***action和mutation有区别*** action执行后,会返回一个promise. 因为调用一般都是async fn  
    // action处理
    module.forEachAction((action, key) => {
        let entry = store._actions[key] || (store._actions[key] = []) // 发布订阅,有就用,没有就是个数组
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
}







export default class Store {
    // 第一步数据格式化
    // 第二步安装,把他们存在我们需要的变量上 
    // 第三步 给容器添加对应的状态

    constructor(options) {
        let store = this;

        // { state,getter,mutations,actions,modules }
        store._modules = new ModuleCollection(options); // 格式化为一个树

        // {add:[fn,fn,多个方法]} 发布订阅模式,等到执行的时候找到属性名去循环执行
        store._wrappedGetters = Object.create(null)
        store._mutations = Object.create(null)
        store._actions = Object.create(null)



        let state = store._modules.root.state; // 根状态
        // 定义状态---模块的安装
        // 里面把store._modules.root的每一层的state都摘出来,放到store._modules.root.state里
        installModule(store, state, [], store._modules.root) // 总思路: 给store添加状态,先找到根状态,然后一层一层的插入 第一个参数: 后期修改的参数都会定义到store里 第二个参数,根目录状态,会添加到第一个参数里 第三个参数: 用来递归的数组,记录父子关系 第四个参数: 开始递归的起点

        console.log(store, state);

        // 定义响应式数据
        resetStoreState(store, state);
    }
    get state() {
        return this._state.data
    }
    commit = (type,payload) => {
        let entry =   this._mutations[type] || []
        entry.forEach(handler=>handler(payload))
    }
    dispatch = (type,payload) => {
        let entry =   this._actions[type] || [] // entry可能是多个
        return Promise.all(entry.map(handler=>handler(payload)))// 等待promise完成
    }
    install(app, injectKey) {
        app.provide(injectKey || storeKey, this) // 可以不用app.provide,使用provide() ,因为也可以从vue里解构出来
        app.config.globalProperties.$store = this; // => Vue.prototype.$store 就是把实例放到了全局上. ****这样的话就不会有命名空间了****
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