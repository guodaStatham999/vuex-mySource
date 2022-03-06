import { inject } from 'vue'






export let storeKey = 'store'  // 给store默认名字



// vue内部已经将这些api导出,所以直接引入inject方法
export function useStore(injectKey = storeKey) { // 因为创建的时候,可以创建多个,所以使用的时候命名后需要使用名字
    // 使用的时候如果不命名,肯定是undefined. 
    console.log(injectKey);
    return inject(injectKey) // 就是vue3的inject

}