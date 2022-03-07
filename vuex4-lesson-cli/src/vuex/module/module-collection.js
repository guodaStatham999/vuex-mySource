import Module from './module.js'
import { forEachValue } from '../utils'



export default class ModuleCollection{ 
    constructor(rootModule){ // 传入的options就是根路径 
        this.root = null; //树根
        // 要不停的循环这个对象,一层一层格式化
        this.register(rootModule,[])
    }
    register(rawModule, path){
        let newModule = new Module(rawModule)
        if(path.length == 0){ // 是一个根目录
            // 如果path数组是个空数组,就说明是根目录
            this.root = newModule;
        }else{ // [a] [b] [a,c]
            // 总结下来就是自身的父级
            let parent = path.slice(0,-1).reduce((module,current)=>{
                return module.getChild(current)
            },this.root)
            parent.addChild(path[path.length-1],newModule) // 如果当前路径里是[a]就是a路径,如果是[a,c]就说明a已经注册完了,需要注册的是c,所以取最后一个路径
        }


        // 有孩子了,开始处理树
        if(rawModule.modules){
            
            // 表层循环,只要是有孩子的都要递归处理
            forEachValue(rawModule.modules,(rawChildrenModule,key)=>{ // rawChildrenModule首层是aCount的对象, key是'aCount'这个key值
                this.register(rawChildrenModule,path.concat(key))
            })


        }

        
        // console.log(this.root);
    }
}