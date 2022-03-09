import { createStore } from '@/vuex'

export default createStore({
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
    asyncAdd({ commit }, payload) {
      return new Promise((resolve,reject)=>{
        setTimeout(()=>{
          resolve()
          commit('add', payload)
        },1000)
      }) 
    }
  },
  modules: {
    aSonCount: {
      namespaced: true,
      state: { count: 10, depict:'儿子1' },
      mutations: {
          add(state, payload) {
              state.count += payload
          }
      },
      modules: {
          cCount: {
            namespaced:true,
              state: { cGrandsonCount: 100,depict:'孙子1' },
              mutations: {
                  add(state, payload) {
                      state.cGrandsonCount += payload
                  }
              },
          }
      }
  },
    bSonCount: {
      namespaced:true,

      state: {
        count: 20,
        depict:'儿子2'
      },
      mutations: {
        add(state, payload) {
          state.count += payload
        }
      },
    },
  }
})
