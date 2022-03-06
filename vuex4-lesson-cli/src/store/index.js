import { createStore } from '@/vuex'

export default createStore({
  strict: true,
  state: { // 组件中的data
    count: 1
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
      setTimeout(() => {
        commit('add', payload)
      }, 1000)
    }
  },
  modules: {
    aCount: {
      namespaced:true,
      state: {
        count: 999
      },
      mutations: {
        add(state, payload) {
          state.count += payload
        }
      },
    },
    bCount: {
      namespaced:true,

      state: {
        count: 888
      },
      mutations: {
        add(state, payload) {
          state.count += payload
        }
      },
    },
  }
})
