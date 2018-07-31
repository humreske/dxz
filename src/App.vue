<template>
  <div id="app">
    <div class="title">DXZ</div>
    <div class="stage" id="stage"></div>
    <div class="login" v-if="!isStarted">
      <div class="login__box">
        <span>大名：</span>
        <input style="font-size:26px;width:200px" type="text" v-model="playerName">
        <div style="width:20px"></div>
        <button @click="start">开始</button>
      </div>
    </div>
    <div>{{players}}</div>
  </div>
</template>

<script>
import uuid from "uuid";
import functions from "./js/functions.js"
import moment from "moment";
import j from "json5";
import stage from "./three/stage.js"
export default {
  data() {
    return {
      ws: null,
      playerId: null,
      playerName: null,
      isStarted: false,
      stage: null,
      angel: 0,
      angelH: 0,
      speed: 0,
      speedSide: 0,
      speedSize: 4,
      lastFrameTime: 0,
      diff: 0,
      players: {},
      balls: {},
      frames: 0,
    }
  },
  computed: {
    moveAngel() {
      return functions.direction(this.speed, this.speedSide);
    }
  },
  methods: {
    str(data) {
      return j.stringify(data);
    },
    parse(data) {
      return j.parse(data);
    },
    // commitPlayer(x,y,angel)
    onopen(e) {
      this.ws.send("open");
      // functions.bot(this.ws);
      let data = {
        playerId: this.playerId,
        playerName: this.playerName,
      }
    },
    onmessage(e) {
      let data = null;
      try {
        data = this.parse(e.data)
      } catch (error) {

      }
      if (data) {
        if (data.type === "commitPlayer") {
          if (data.playerId !== this.playerId) {
            if (!this.players[data.playerId]) {
              this.players[data.playerId] = data;
            }
            if (!this.players[data.playerId].obj) {
              let obj = stage.addPlayer(data.x, data.z);
              this.players[data.playerId].obj = obj;
            } else {
              let obj = this.players[data.playerId].obj;
              obj.position.x = data.x;
              obj.position.z = data.z;
              obj.rotation.y = data.angel;
              this.players[data.playerId] = data;
              this.players[data.playerId].obj = obj;
            }
          }
        }
      }

      // console.log(`message`, e);
    },
    onclose(e) {
      console.log(e);
    },
    onerror(e) {
      console.log(e);
    },

    moveSpeed(s) {
      return s * this.diff / 16;
    },
    playerMove() {
      // console.log(stage.camera.position.y);
      if (this.moveAngel != "freeze") {
        stage.camera.position.x += this.moveSpeed(this.speedSize) * Math.cos(this.angel + this.moveAngel);
        stage.camera.position.z += this.moveSpeed(this.speedSize) * Math.sin(this.angel + this.moveAngel);
        if (stage.camera.position.x > 1480) {
          stage.camera.position.x = 1480;
        }
        if (stage.camera.position.x < -1480) {
          stage.camera.position.x = -1480;
        }
        if (stage.camera.position.z > 1480) {
          stage.camera.position.z = 1480;
        }
        if (stage.camera.position.z < -1480) {
          stage.camera.position.z = -1480;
        }
      }
    },
    animate() {
      this.frames++;
      if (this.frames > 100000) {
        this.frames = 0;
      }

      let data = {
        type: "commitPlayer",
        playerId: this.playerId,
        x: stage.camera.position.x,
        z: stage.camera.position.z,
        angel: -this.angel,
      }
      this.ws.send(this.str(data));
      let time = moment().valueOf();
      this.diff = time - this.lastFrameTime;
      this.lastFrameTime = time;
      this.playerMove();

    },

    mouseMove(mx, my) {
      // console.log(mx, my);
      // console.log(stage.camera);
      // stage.camera.rotation.y += -mx / 500;
      // stage.camera.up.x += -my / 500;
      this.angel += mx / 500;
      if (this.angel >= Math.PI * 2 || this.angel <= -Math.PI * 2) {
        this.angel = 0;
      }
      // console.log(this.angel);
      this.angelH += -my / 500;
      if (this.angelH >= Math.PI / 2 - 0.1) {
        this.angelH = Math.PI / 2 - 0.1
      }
      if (this.angelH <= -Math.PI / 2 + 0.1) {
        this.angelH = -Math.PI / 2 + 0.1
      }
      let y = 1000 * Math.sin(this.angelH);
      let l = 1000 * Math.cos(this.angelH);
      let x = l * Math.cos(this.angel) + stage.camera.position.x;
      let z = l * Math.sin(this.angel) + stage.camera.position.z;
      stage.camera.lookAt(x, y, z);
    },
    mouseDown() {
      // let a=stage.addPlayer(500, 600);
      // console.log(a);
      // console.log("md");
    },
    mouseUp() { },
    keyDown(e) {
      // console.log(e);
      switch (e) {
        case "w":
          this.speed = 1;
          break;
        case "s":
          this.speed = -1;
          break;
        case "d":
          this.speedSide = 1;
          break;
        case "a":
          this.speedSide = -1;
          break;

        default:
          break;
      }
    },
    keyUp(e) {
      switch (e) {
        case "w":
          this.speed = 0;
          break;
        case "s":
          this.speed = 0;
          break;
        case "d":
          if (this.speedSide === 1) {
            this.speedSide = 0;
          }
          break;
        case "a":
          if (this.speedSide === -1) {
            this.speedSide = 0;
          }
          break;

        default:
          break;
      }
    },
    start() {
      // stage.init();
      if (this.playerName) {
        localStorage.setItem("playerName", this.playerName);
        if (!this.playerId) {
          this.playerId = uuid.v4();
          localStorage.setItem("playerId", this.playerId);
        }
        // console.log("sdf");
        // console.log(this.ws);
        this.ws = new WebSocket("ws://192.168.0.104:8080");

        this.ws.onopen = this.onopen;
        this.ws.onmessage = this.onmessage;
        this.ws.onclose = this.onclose;
        this.ws.onerror = this.onerror;
        stage.animate = this.animate;
        this.isStarted = true;


        // this.stage = stage;
        // this.stage.init();
        // this.player = stage.addPlayer(500, -500);

      } else {
        alert("请输入大名。111");
      }

    },
  },
  beforeDestroy() {
    this.ws = null;
    // console.log("bd");
  },

  mounted() {
    // console.log("mounted");
    document.pointerLockElement
    this.playerName = localStorage.getItem("playerName");
    this.playerId = localStorage.getItem("playerId");
    stage.mouseMove = this.mouseMove;
    stage.mouseDown = this.mouseDown;
    stage.mouseUp = this.mouseUp;
    stage.keyDown = this.keyDown;
    stage.keyUp = this.keyUp;
    stage.init();
    // console.log(stage);





    this.start();


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
  height: 800px;
  background: #cad7dd;
  border: solid 2px #000;
}
.login {
  width: 100vw;
  height: 100vh;
  left: 0;
  top: 0;
  position: fixed;
  align-items: center;
  justify-content: center;
  display: flex;
  background: rgba(0, 0, 0, 0.479);
}
.login__box {
  width: 400px;
  height: 100px;
  background: #fff;
  border: solid 3px #000;
  align-items: center;
  justify-content: center;
  display: flex;
  font-size: 26px;
}
</style>
