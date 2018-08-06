<template>
  <div id="app">
    <!-- <div class="title">DXZ</div> -->
    <div style="height:20px"></div>
    <div class="stage" :style="stageStyle" id="stage">
      <div class="mask" v-if="isDie">3秒后复活...</div>
    </div>
    <div class="login" v-if="!isStarted">
      <div class="login__box">
        <span>大名：</span>
        <input style="font-size:26px;width:200px" type="text" v-model="playerName">
        <div style="width:20px"></div>
        <button @click="start">开始</button>
      </div>
    </div>
    <div class="health">
      <div class="health__in" v-if="!isDie" :style="{width:health+'%'}"></div>
      <!-- <div class="resurgence-text" v-if="isDie">3秒后复活...</div> -->
    </div>
    <!-- <div>{{players}}</div> -->
  </div>
</template>

<script>
import uuid from "uuid";
import functions from "./js/functions.js"
import moment from "moment";
import j from "json5";
import stage from "./js/stage.js"
export default {
  data() {
    return {
      stageStyle: {
        top: 0,
        left: 0
      },
      ws: null,
      playerId: null,
      playerName: null,
      isStarted: false,
      stage: null,
      angle: 0,
      angleH: 0,
      speed: 0,
      speedSide: 0,
      speedSize: 4,
      bulletSpeed: 20,
      gravity: 0.1,
      lastFrameTime: 0,
      diff: 0,
      players: {},
      bullets: {},
      playerBullets: {},
      frames: 0,
      isShoot: false,
      health: 100,
      playerVy: 0,
      isJumping: false,
      isJumpKeyDown: false,
      shakeSize: 0,
      shakeTimer: null,
      isDie: false,
    }
  },
  computed: {
    moveAngle() {
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
    // commitPlayer(x,y,angle)
    onopen(e) {
      // this.ws.send("open");
      // functions.bot(this.ws);
      let data = {
        playerId: this.playerId,
        playerName: this.playerName,
      }
      stage.animate = this.animate;
    },
    onmessage(e) {
      let data = null;
      try {
        data = this.parse(e.data)
      } catch (error) {

      }
      if (data) {
        if (data.type === "commitPlayer") {
          // console.log(data);
          // console.log(data.health);
          if (data.playerId !== this.playerId && data.health > 0) {
            if (!this.players[data.playerId]) {
              this.players[data.playerId] = data;
            }
            if (!this.players[data.playerId].obj) {
              let obj = stage.addPlayer(data.x, data.z);
              this.players[data.playerId].obj = obj;
            } else {
              let obj = this.players[data.playerId].obj;
              obj.position.x = data.x;
              obj.position.y = data.y - 80;
              obj.position.z = data.z;
              obj.rotation.y = data.angle;
              stage.setHealth(obj, data.health);
              this.players[data.playerId] = data;
              this.players[data.playerId].obj = obj;
              // console.log(data);
            }
          }
        }
        if (data.type === "die") {
          // console.log(this.players[data.playerId]);
          if (this.players[data.playerId]) {
            setTimeout(() => {
              stage.remove(this.players[data.playerId].obj)
              delete this.players[data.playerId];
            }, 200)
          }
        }
        if (data.type === "shoot") {
          // console.log(data);
          let bulletId = uuid.v4();
          this.bullets[bulletId] = data;
          let bullet = stage.addBullet(data.x, data.y, data.z);
          this.bullets[bulletId].obj = bullet;
          if (data.playerId === this.playerId) {
            this.playerBullets[bulletId] = this.bullets[bulletId];
          }

        }
        if (data.type === "hit") {
          if (data.hitPlayerId == this.playerId) {
            if (this.health > 0) {
              this.health -= 5;
              this.shake(3);

              if (this.health <= 0) {
                this.health = 0;
                this.isDie = true;
                this.resurgence();
                let data = {
                  type: "die",
                  playerId: this.playerId,
                }
                this.ws.send(this.str(data));
              }
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
    shake(size = 8) {
      this.shakeSize = size;
      this.shakeTimer = setInterval(() => {
        let angle = Math.random() * 6.28;
        this.stageStyle = {
          left: Math.cos(angle) * this.shakeSize + "px",
          top: Math.sin(angle) * this.shakeSize + "px"
        }
        this.shakeSize--;
        if (this.shakeSize < 0) {
          this.stageStyle = {
            left: 0,
            top: 0
          }
          clearTimeout(this.shakeTimer);
        }
      }, 20)
    },
    resurgence() {
      setTimeout(() => {
        this.isDie = false;
        this.health = 100;
        stage.camera.position.x = Math.random() * 2000 - 1000;
        stage.camera.position.z = Math.random() * 2000 - 1000;
        stage.camera.position.y = 80;
      }, 3000)
    },

    moveSpeed(s) {
      return s * this.diff / 16;
    },
    playerMove() {
      // console.log(stage.camera.position.y);
      if (this.moveAngle != "freeze") {
        stage.camera.position.x += this.moveSpeed(this.speedSize) * Math.cos(this.angle + this.moveAngle);
        stage.camera.position.z += this.moveSpeed(this.speedSize) * Math.sin(this.angle + this.moveAngle);
        if (stage.camera.position.x > 1390) {
          stage.camera.position.x = 1390;
        }
        if (stage.camera.position.x < -1390) {
          stage.camera.position.x = -1390;
        }
        if (stage.camera.position.z > 1390) {
          stage.camera.position.z = 1390;
        }
        if (stage.camera.position.z < -1390) {
          stage.camera.position.z = -1390;
        }
      }
      if (this.isJumping) {
        stage.camera.position.y += this.playerVy;
        this.playerVy -= this.gravity * 5;
        // console.log(stage.camera.position.y);
        if (stage.camera.position.y < 80) {
          stage.camera.position.y = 80;
          this.isJumping = false;
        }
      }
      // 准星
      let y = 75 * Math.sin(this.angleH) + stage.camera.position.y;
      let l = 75 * Math.cos(this.angleH);
      let x = l * Math.cos(this.angle) + stage.camera.position.x;
      let z = l * Math.sin(this.angle) + stage.camera.position.z;
      stage.cross.position.x = x;
      stage.cross.position.y = y;
      stage.cross.position.z = z;
    },
    bulletMove() {
      // console.log(obj.position.y);
      for (const key in this.bullets) {
        if (this.bullets.hasOwnProperty(key)) {
          let data = this.bullets[key];
          let obj = this.bullets[key].obj;
          obj.position.x += this.moveSpeed(data.vx);
          obj.position.y += this.moveSpeed(data.vy);
          obj.position.z += this.moveSpeed(data.vz);
          data.vy -= this.moveSpeed(this.gravity);
          if (obj.position.y < 0) {
            stage.addHitEffect(obj.position.x, obj.position.y, obj.position.z);

            // console.log(123123);
            stage.remove(obj)
            delete this.bullets[key];
            if (this.playerBullets[key]) {
              delete this.playerBullets[key];
            }
          }


        }
      }
      // console.log("-----------");
    },
    commitPlayer() {
      // console.log(this.isDie);
      let data = {
        type: "commitPlayer",
        playerId: this.playerId,
        x: stage.camera.position.x,
        y: stage.camera.position.y,
        z: stage.camera.position.z,
        angle: -this.angle,
        health: this.health
      }
      if (!this.isDie) {
        this.ws.send(this.str(data));
      }
    },

    hitTest() {
      let hitTestObj = (bullet, player) => {
        if (bullet && player) {
          if (Math.abs(bullet.position.x - player.position.x) < 50 && Math.abs(bullet.position.z - player.position.z) < 50 && bullet.position.y < 90) {
            // console.log("hit!!!!!!!!");
            return true
          } else {
            return false;
          }
        } else {
          return false;
        }
      }
      for (const keyBullet in this.playerBullets) {
        for (const keyPlayer in this.players) {
          if (this.playerBullets[keyBullet] && this.players[keyPlayer]) {
            if (hitTestObj(this.playerBullets[keyBullet].obj, this.players[keyPlayer].obj)) {
              // 
              // console.log("hit!!!!");
              // console.log(this.playerBullets[keyBullet].obj.position, this.players[keyPlayer].obj.position);
              let obj = this.playerBullets[keyBullet].obj;
              stage.addHitEffect(obj.position.x, obj.position.y, obj.position.z);

              let data = {
                type: "hit",
                playerId: this.playerId,
                hitPlayerId: this.players[keyPlayer].playerId,
                x: this.playerBullets[keyBullet].obj.position.x,
                y: this.playerBullets[keyBullet].obj.position.y,
                z: this.playerBullets[keyBullet].obj.position.z,
              }
              this.ws.send(this.str(data));


              stage.remove(this.playerBullets[keyBullet].obj)
              delete this.playerBullets[keyBullet];
              delete this.bullets[keyBullet];
            }
          }
        }
      }
    },
    shoot() {
      if (this.frames % 10 == 0) {
        if (this.isShoot) {
          let angle = this.angle;
          let angleH = this.angleH + 0.12;
          let v = functions.angleToSpeed(angle, angleH, this.bulletSpeed);

          let data = {
            type: "shoot",
            playerId: this.playerId,
            x: stage.camera.position.x,
            y: stage.camera.position.y,
            z: stage.camera.position.z,
            vx: v.vx,
            vy: v.vy,
            vz: v.vz,
          }
          // console.log(stage.camera.position);
          if (!this.isDie) {
            this.ws.send(this.str(data));
          }
        }
      }
    },
    animateReady() {
      let time = moment().valueOf();
      this.diff = time - this.lastFrameTime;
      this.lastFrameTime = time;
      this.frames++;
      if (this.frames > 100000) {
        this.frames = 0;
      }
    },
    animate() {
      this.animateReady();
      this.bulletMove();
      this.shoot();
      this.hitTest();
      this.commitPlayer();
      if (!this.isDie) {
        this.playerMove();
      }
      this.$forceUpdate();
    },

    mouseMove(mx, my) {
      // console.log(mx, my);
      // console.log(stage.camera);
      // stage.camera.rotation.y += -mx / 500;
      // stage.camera.up.x += -my / 500;
      this.angle += mx / 500;
      if (this.angle >= Math.PI * 2 || this.angle <= -Math.PI * 2) {
        this.angle = 0;
      }
      // console.log(this.angle);
      this.angleH += -my / 500;
      if (this.angleH >= Math.PI / 2 - 0.1) {
        this.angleH = Math.PI / 2 - 0.1
      }
      if (this.angleH <= -Math.PI / 2 + 0.1) {
        this.angleH = -Math.PI / 2 + 0.1
      }
      let y = 100 * Math.sin(this.angleH) + stage.camera.position.y;
      let l = 100 * Math.cos(this.angleH);
      let x = l * Math.cos(this.angle) + stage.camera.position.x;
      let z = l * Math.sin(this.angle) + stage.camera.position.z;
      stage.camera.lookAt(x, y, z);

    },
    mouseDown() {
      this.isShoot = !this.isShoot;

      // let a=stage.addPlayer(500, 600);
      // console.log(a);
      // console.log("md");
    },
    mouseUp() {
      // this.isShoot = false;
    },
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
        case " ":
          if (!this.isJumpKeyDown) {
            this.isJumpKeyDown = true;
            if (!this.isJumping) {
              stage.camera.position.y = 81;
              this.playerVy = 10;
              this.isJumping = true;
            }
          }
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
        case " ":
          this.isJumpKeyDown = false;
          break;

        default:
          break;
      }
    },
    wsInit() {

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
    // this.ws = null;
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
  position: relative;
  margin: auto;
  width: 1200px;
  height: 800px;
  background: #cad7dd;
  border: solid 2px #000;
}
.mask {
  position: absolute;
  width: 1200px;
  height: 800px;
  left: 0;
  top: 0;
  background: rgba(0, 0, 0, 0.336);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  font-family: "微软雅黑";
  color: #fff;
}
.health {
  margin: auto;
  margin-top: 20px;
  width: 500px;
  height: 40px;
  border: solid 2px #000;
}
.health__in {
  width: 100%;
  height: 40px;
  background: #f00;
}
.resurgence-text {
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
