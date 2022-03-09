import Module from './module.js'
import { forEachValue } from '../utils'



export default class ModuleCollection{ 
    constructor(rootModule){ // 传入的options就是根路径 
        this.root = null; //树根
        // 要不停的循环这个对象,一层一层格式化
        this.register(rootModule,[])
    }
    register(rawModule, path){
        let newModule = new Module(rawModule); // 把传入的参数进行格式化
        if(path.length == 0){ // 是一个根目录
            // 如果path数组是个空数组,就说明是根目录
            this.root = newModule;
        }else{ // [a] [b] [a,c]
            let pathSlice = path.slice(0,-1); // 如果只有一层,就要截取掉最后一个,这样下面的reduce就可以使用默认值this.root.
            console.log(this.root);

            // reduce有循环就使用最后的返回参数--永远使用最后一次返回的这个比较重要 ,也就是倒数第二次的父亲/或者 没有循环就是使用默认值
            let parent = pathSlice.reduce((module,current)=>{ // 如果只是一个孩子,reduce的结果就是默认值this.root(最外层)
                let res = module.getChild(current)
                return res // 如果有pathSlice就会使用倒数第二个参数-也就是孩子的父亲. 如果是个空数组,就会使用根目录-this.root
            },this.root)

            
            parent.addChild(path[path.length-1],newModule) // 如果当前路径里是[a]就是a路径,如果是[a,c]就说明a已经注册完了,需要注册的是c,所以取最后一个路径
        }


        // 有孩子了,开始处理树 -----深度遍历
        if(rawModule.modules){
            // *****感觉需要记录*****深度遍历,有孩子就去处理孩子的孩子.
            // 表层循环,只要是有孩子的都要递归处理
            forEachValue(rawModule.modules,(rawChildrenModule,key)=>{ // rawChildrenModule首层是aCount的对象, key是'aCount'这个key值
                this.register(rawChildrenModule,path.concat(key)) // path.concat是组最外层不会触发,只有到了孙子的时候,才会使用到儿子的路径
            })


        }

        
        // console.log(this.root);
    }
    getNamespaced(path){
        // 就是树的遍历,每次path都是外层installModule递归出来的路径,所以直接使用就行?
        // 要循环这个根,沿着向下找
        let module = this.root; // [a,c] =变成=>'a/c'
        let name =  path.reduce((namespaceStr,key)=>{
            module =    module.getChild(key) // 这个是当前模块的子模块,而且要用儿子作为下一次的父亲
            return  namespaceStr + (module.namespaced? key + '/' : '')
        },'')
        console.log(name);
        return name
    }
}