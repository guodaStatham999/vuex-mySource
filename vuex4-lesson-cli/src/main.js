import { createApp } from 'vue'
import App from './App.vue'
import store from './store'

// Vue.use是插件的用法 会默认调用store中的install方法
createApp(App).use(store,'my').mount('#app')
