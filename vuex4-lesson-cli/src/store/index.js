import {
  createStore
} from '@/vuex'

function customPlugin(store) {
  console.log(store);
  let local = localStorage.getItem('VUEX:STATE')
  if (local) {
    store.replaceState(JSON.parse(local))
  }
  store.subscribe((mutation, state) => { // 每当状态发生变化,(调用mutation的时候,就会执行此回调---错误修改会触发吗?)
    console.log(mutation, state); // 默认传递俩参数,修改的mutation和当前state
    localStorage.setItem('VUEX:STATE', JSON.stringify(state))
  })
}

let store = createStore({
  plugins: [ // vuex插件: 任何插件都是一个函数
    // 会按照注册的顺序依次执行,从上到下. 执行的时候会把store传递过来
    // 支持了发布订阅模式---也就是vuex有发布订阅模式
    customPlugin
  ],
  strict: true, // 不允许用户非法修改状态,(只能在mutation里修改,否则就会发生异常)
  state: { // 组件中的data
    count: 1,
    depict: '外层'
  },
  getters: { // vuex4没有实现这个功能
    double(state) {
      return state.count * 2
    }
  },
  mutations: {
    add(state, payload) {
      state.count += payload
    }
  },
  actions: {
    asyncAdd({
      commit
    }, payload) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve()
          commit('add', payload)
        }, 1000)
      })
    }
  },
  modules: {
    aSonCount: {
      namespaced: true,
      state: {
        count: 10,
        depict: '儿子1'
      },
      mutations: {
        add(state, payload) {
          state.count += payload
        }
      },
      // modules: { // registerModule是动态添加模块
      //     cCount: {
      //       namespaced:true,
      //         state: { cGrandsonCount: 100,depict:'孙子1' },
      //         mutations: {
      //             add(state, payload) {
      //                 state.cGrandsonCount += payload
      //             }
      //         },
      //     }
      // }
    },
    bSonCount: {
      namespaced: true,

      state: {
        count: 20,
        depict: '儿子2'
      },
      mutations: {
        add(state, payload) {
          state.count += payload
        }
      },
    },
  }
})

// 传参可以是数组,也可以是字符串
// 字符串是注册到根目录下(因为没有父级),数组就是注册到指定路径下(某个模块下的某个模块)
store.registerModule(['aSonCount', 'cCount'], {
  namespaced: true,
  state: {
    cGrandsonCount: 100,
    depict: '孙子1'
  },
  mutations: {
    add(state, payload) {
      state.cGrandsonCount += payload
    }
  },
})
export default store