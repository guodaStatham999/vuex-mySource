import {inject} from 'vue'
let storeKey = 'store'  // 给store默认名字
class Store{
    constructor(options){
        // this.a = 1000 // 这个值在模板里有,但是在setup里却没有. 转成render函数,会去上下文里找函数
        this.state = options.state
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