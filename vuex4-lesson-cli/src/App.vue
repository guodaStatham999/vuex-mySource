<template>
  <div>
    计数器:{{store.state.count}}
    double:{{store.getters.double}}
    <button @click="$store.state.count++">错误增加</button>
    <button @click="add">增加</button>
    <button @click="asyncAdd">异步增加</button>
    {{$store.a}}
  </div>
</template>

<script setup>
  import { useStore } from '@/vuex'
  
  let store = useStore('my')
  console.log(store);
  function add(){
    store.commit('add',3)
  }
  
  function asyncAdd(){
    store.dispatch('asyncAdd',10)
  }
</script>


