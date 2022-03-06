<template>
  <div>
    计数器:{{store.state.count}}
    double:{{store.getters.double}}
    <button @click="$store.state.count++">错误增加</button>
    <button @click="add">增加</button>
    <button @click="asyncAdd">异步增加</button>
    <!-- {{$store.a}} -->



  // 下面是modules部分
    <hr>
    <!-- aCount模块:
    {{store.state.aCount.count}}
    bCount模块:
    {{store.state.bCount.count}}

        <button @click="$store.commit('aCount/add',33)">增加aCount/count参数</button>
    <button  @click="$store.commit('bCount/add',33)">增加bCount/count参数</button> -->
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


