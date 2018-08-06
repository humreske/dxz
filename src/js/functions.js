export default {
  botData: {
    p1: {
      x: Math.random() * 200 - 100,
      z: Math.random() * 200 - 100,
      r: Math.random() * Math.PI * 2,
      vx: 0,
      vz: 0,
      vr: 0,
      ar: 0,
      health: 100,
    }
  },

  direction(speed, speedSide) {
    let pi = Math.PI;
    if (speed != 0 || speedSide != 0) {
      switch (speed) {
        case 0:
          switch (speedSide) {
            case 1:
              return pi / 2;
              break;
            case -1:
              return -pi / 2;
              break;

            default:
              break;
          }
          break;
        case 1:
          switch (speedSide) {
            case 0:
              return 0;
              break;
            case 1:
              return pi / 4;
              break;
            case -1:
              return -pi / 4;
              break;

            default:
              break;
          }
          break;
        case -1:
          switch (speedSide) {
            case 0:
              return pi;
              break;
            case 1:
              return pi / 4 * 3;
              break;
            case -1:
              return -pi / 4 * 3;
              break;

            default:
              break;
          }
          break;

        default:
          break;
      }
    } else {
      return "freeze";
    }
  },
  angleToSpeed(angle, angleH, speed) {
    let y = Math.sin(angleH);
    let l = Math.cos(angleH);
    let x = l * Math.cos(angle);
    let z = l * Math.sin(angle);
    return {
      vx: x * speed,
      vy: y * speed,
      vz: z * speed,
    }
  },
  bot(ws) {
    let data = {
      type: "commitPlayer",
      playerId: "enemy1",
      x: 0,
      y: 80,
      z: 0,
      angle: Math.random() * Math.PI * 2,
      health: 100

    }
    ws.send(JSON.stringify(data));

    data = {
      type: "commitPlayer",
      playerId: "enemy2",
      x: Math.random() * 2000 - 1000,
      y: 80,
      z: Math.random() * 2000 - 1000,
      angle: Math.random() * Math.PI * 2,
      health: 100
    }
    ws.send(JSON.stringify(data));

    setInterval(() => {
      let angle = this.botData.p1.r;
      let angleH = Math.random() * 0.3;
      let v = this.angleToSpeed(angle, angleH, 20);

      let data = {
        type: "shoot",
        playerId: "enemy1",
        x: this.botData.p1.x,
        y: 80,
        z: this.botData.p1.z,
        vx: v.vx,
        vy: v.vy,
        vz: v.vz,
      }
      ws.send(JSON.stringify(data));

    }, 50)
    setInterval(() => {
      // if (this.botData.p1.health > 0) {
      // this.botData.p1.health--;

      this.botData.p1.vx += Math.cos(this.botData.p1.r);
      this.botData.p1.vz += Math.sin(this.botData.p1.r);
      this.botData.p1.r += this.botData.p1.vr;
      this.botData.p1.vr += this.botData.p1.ar;
      this.botData.p1.ar = Math.random() * 0.008 - 0.004;
      if (this.botData.p1.vx > 3) {
        this.botData.p1.vx = 3;
      }
      if (this.botData.p1.vx < -3) {
        this.botData.p1.vx = -3;
      }
      if (this.botData.p1.vz > 3) {
        this.botData.p1.vz = 3;
      }
      if (this.botData.p1.vz < -3) {
        this.botData.p1.vz = -3;
      }
      if (this.botData.p1.vr > 0.1) {
        this.botData.p1.vr = 0.1;
      }
      if (this.botData.p1.vr < -0.1) {
        this.botData.p1.vr = -0.1;
      }
      this.botData.p1.x += this.botData.p1.vx;
      this.botData.p1.z += this.botData.p1.vz;
      let data = {
        type: "commitPlayer",
        playerId: "enemy1",
        x: this.botData.p1.x,
        y: 80,
        z: this.botData.p1.z,
        angle: -this.botData.p1.r,
        health: this.botData.p1.health

      }
      ws.send(JSON.stringify(data));
      // } else {
      //   let data = {
      //     type: "die",
      //     playerId: "enemy1",
      //   }
      //   ws.send(JSON.stringify(data));
      // }
    }, 17)
    setTimeout(() => {
      let data = {
        type: "die",
        playerId: "enemy2",
      }
      ws.send(JSON.stringify(data));
    }, 2000)


    // setInterval(() => {
    //   let data = {
    //     type: "hit",
    //     playerId: "enemy1",
    //     hitPlayerId: "3ffcaf8f-0e7a-4655-bac7-366a8b765866",
    //     x: 100,
    //     y: 30,
    //     z: 100,
    //   }
    //   ws.send(JSON.stringify(data));



    // }, 200)


  }
}
