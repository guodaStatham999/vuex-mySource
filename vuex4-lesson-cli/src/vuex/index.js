import { inject, reactive } from 'vue'


import {forEachValue} from './utils'
import {storeKey,useStore} from './injectKey.js'
import Store from './store.js'





// 创建容器,返回一个store,而且可以多次创造. 创建多个store返回的是哪个store呢?  可以给store不同的名字,这样使用的时候就要区分名字了
function createStore(options) {
    // console.log(options);
    return new Store(options)
}


export {
    useStore,
    createStore
} 





