<template>
  <div>
    计数器:{{ store.state.count }}
    <hr />
    double:{{ store.getters.double }}
    <button @click="$store.state.count++">错误增加</button>
    <button @click="add">增加</button>
    <button @click="asyncAdd">异步增加</button>
    <!-- {{$store.a}} -->

    <hr />
    下面是modules部分
    <hr />
    aSonCount模块:
    {{ store.state.aSonCount.count }}<br />
    bSonCount模块:
    {{ store.state.bSonCount.count }}<br />
    c孙子模块:
    {{ store.state.aSonCount.cCount.cGrandsonCount }} <br />

    <button @click="$store.commit('aSonCount/add', 33)">
      增加aSonCount/count参数</button
    ><br />
    <button @click="$store.commit('bSonCount/add', 33)">
      增加bSonCount/count参数
    </button><br />
    <!-- 修改孙子层的数据,传递参数的时候就是多一层路径 -->
    <button @click="$store.commit('aSonCount/cCount/add', 33)">
      修改c(a的孙子的参数修改)
    </button>
  </div>
</template>

<script setup>
import { useStore } from "@/vuex";

let store = useStore("my");
console.log(store);
function add() {
  store.commit("add", 3);
}
function asyncAdd() {
  store.dispatch("asyncAdd", 10).then(() => {
    alert("ok");
  });
}
</script>


