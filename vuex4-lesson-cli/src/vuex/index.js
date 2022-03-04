import {inject,reactive} from 'vue'
let storeKey = 'store'  // 给store默认名字
class Store{
    constructor(options){
        // this.a = 1000 // 这个值在模板里有,但是在setup里却没有. 转成render函数,会去上下文里找函数

        /// vuex3 内部是创造一个vue的实例,但是vuex4是采用vue3提供的响应式方法(可能是monorepo初见效果,单独使用响应式)
        let store = this; // 保存一下this,后面会用到



        // store._state.data 就可以直接拿到state了
        store._state =  reactive({ // 以前是new vue,现在reactive就可以了
            data:options.state // 多加一层data...是有原因的=> 为了replaceState的时候不是替换整个reactive,而只是替换一个属性data
        })


        // vuex 里面有个比较重要的api   => replaceState :官网解释=>替换 store 的根状态，仅用状态合并或时光旅行调试。 
    }
    install(app,injectKey){ // use的时候会触发这个install方法, createApp().use(store,'my命名空间')
        // console.log(app);
        // console.log(injectKey);

        // 全局暴露一个变量,暴露的是store的实例
        app.provide(injectKey || storeKey,this) // 可以不用app.provide,使用provide() ,因为也可以从vue里解构出来

        app.config.globalProperties.$store =  this; // => Vue.prototype.$store 就是把实例放到了全局上. ****这样的话就不会有命名空间了****
    }
}









// 创建容器,返回一个store,而且可以多次创造. 创建多个store返回的是哪个store呢?  可以给store不同的名字,这样使用的时候就要区分名字了
export function createStore(options){
    // console.log(options);
    return new Store(options)
}


// vue内部已经将这些api导出,所以直接引入inject方法
export function useStore(injectKey = storeKey){ // 因为创建的时候,可以创建多个,所以使用的时候命名后需要使用名字
    // 使用的时候如果不命名,肯定是undefined. 
    console.log(injectKey);
    return inject(injectKey) // 就是vue3的inject
    
}