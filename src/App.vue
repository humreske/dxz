<template>
  <div id="app">
    <div class="title">DXZ</div>
    <div class="stage"></div>
  </div>
</template>

<script>

export default {
  data() {
    return {
      ws: null
    }
  },
  methods: {
    onopen(e) {
      console.log(e);
    },
    onmessage(e) {

    },
    onclose(e) {

    },
    onerror(e) {

    },
  },
  created() {

    // 连接服务端
    // 创建websocket
    this.ws = new WebSocket("ws://localhost:7272");
    // 当socket连接打开时，输入用户名
    this.ws.onopen = this.onopen;
    // 当有消息时根据消息类型显示不同信息
    this.ws.onmessage = this.onmessage;
    this.ws.onclose = this.onclose
    this.ws.onerror = this.onerror
  }
}
</script>

<style>
html,
body {
  margin: 0;
  padding: 0;
}
.title {
  font-size: 40px;
  text-align: center;
  margin: 20px;
}
.stage {
  margin: auto;
  width: 1200px;
  height: 900px;
  background: #cad7dd;
}
</style>
