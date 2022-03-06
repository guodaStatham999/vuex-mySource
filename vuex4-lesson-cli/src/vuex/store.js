import { forEachValue } from './utils'
import { reactive } from 'vue';

class ModuleCollection{
    constructor(rootModule){ // 传入的options就是根路径 
        console.log(rootModule);
        this.root = null; //树根
        // 要不停的循环这个对象,一层一层格式化
        this.register(rootModule,[])
    }
    register(rawModule, path){
        if(path.length == 0){ // 是一个根目录
            this.root = { // 如果path数组是个空数组,就说明是根目录
                _raw:rawModule,
                state:rawModule.state,
                _children:{}
            }
        }else{
            // 这个模块也不一定放在根上
        }


        // 有孩子了,开始处理树
        if(rawModule.modules){

            // 表层循环,只要是有孩子的都要递归处理
            forEachValue(rawModule.modules,(rawChildrenModule,key)=>{
                this.register(rawChildrenModule,path.concat(key))
            })
        }
        console.log(rawModule);
    }
}


export default class Store {
    constructor(options) {
        // { state,getter,mutations,actions,modules }
         this._modules = new ModuleCollection(options); // 格式化为一个树
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