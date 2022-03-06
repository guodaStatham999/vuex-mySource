import { forEachValue } from './utils'
import { reactive } from 'vue';


export default class Store {
    constructor(options) {
        // { state,getter,mutations,actions,modules }
    }

    install(app, injectKey) {


        app.provide(injectKey || storeKey, this) // 可以不用app.provide,使用provide() ,因为也可以从vue里解构出来
        app.config.globalProperties.$store = this; // => Vue.prototype.$store 就是把实例放到了全局上. ****这样的话就不会有命名空间了****


    }
}
