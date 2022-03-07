// import { forEachValue } from './utils'
// import { reactive } from 'vue';
import ModuleCollection from './module/module-collection.js'


// ---事后总结: 
// install(a)
    // a,b先安装,安装a的时候有c就安装c了
// install(b)
// 第一个参数: 给谁安装,给store 第二个参数: 安装什么,安装state 第三个参数: 怎么记录? 用[]记录父子关系的路径 第四个参数: 从水开始? 从根目录开始
function installModule(store,rootState,path,module){ // 安装也是递归安装
    let isRoot = !path.length; // 如果是空数组,说明是根

    if(!isRoot){
        // 依旧是刚才的思路,其实就是一个数组取最后一个人参数作为父亲,如果是只有一个参数,就会被截取掉,然后使用默认值,再后面会给父亲的children重新赋值.
        let parentState=   path.slice(0,-1).reduce((state,key)=>state[key],rootState)
        debugger
        parentState[path[path.length-1]] = module.state; // 把父级的[path[path.length-1]](没读懂,需要debugger一下) 从新复制
    }
    console.log(module);


    module.forEachChild((child,key)=>{ // key就是 aCount,bCount这个路径
        // 深度遍历: 循环当前模块的孩子,遇到孩子继续遍历他的孩子
        installModule(store,rootState,path.concat(key),child)
    })
}

export default class Store {
    constructor(options) {
        let store = this;

        // { state,getter,mutations,actions,modules }
         this._modules = new ModuleCollection(options); // 格式化为一个树
         console.log(this._modules);



         let state = store._modules.root.state; // 根状态
         // 定义状态---模块的安装
         installModule(store,state,[],store._modules.root) // 总思路: 给store添加状态,先找到根状态,然后一层一层的插入 第一个参数: 后期修改的参数都会定义到store里 第二个参数,根目录状态,会添加到第一个参数里 第三个参数: 用来递归的数组,记录父子关系 第四个参数: 开始递归的起点

         console.log(state);
         debugger
   
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