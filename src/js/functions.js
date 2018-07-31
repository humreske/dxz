export default {
  botData: {
    p1: {
      x: Math.random() * 200 - 100,
      z: Math.random() * 200 - 100,
      r: Math.random() * Math.PI * 2,
      rh: 0,
      vx: 0,
      vz: 0,
      vr: 0,
      ar: 0,
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
  bot(ws) {
    let data = {
      type: "commitPlayer",
      playerId: "enemy1",
      x: this.p1x,
      z: this.p1z,
      angel: Math.random() * Math.PI * 2,
    }
    ws.send(JSON.stringify(data));

    data = {
      type: "commitPlayer",
      playerId: "enemy2",
      x: Math.random() * 2000 - 1000,
      z: Math.random() * 2000 - 1000,
      angel: Math.random() * Math.PI * 2,
    }
    ws.send(JSON.stringify(data));

    setInterval(() => {
      let data = {
        type: "shoot",
        playerId: "enemy1",
        x: this.botData.p1.x,
        z: this.botData.p1.z,
        angel: -this.botData.p1.r,
        angelH: Math.random() * Math.PI - Math.PI / 2
      }

    }, 2000)
    setInterval(() => {
      // let vx = Math.cos(this.p1fx) * 2;
      // let vz = Math.sin(this.p1fx) * 2;
      // this.p1x += vx;
      // this.p1z += vz;
      // console.log(vx);
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
        z: this.botData.p1.z,
        angel: -this.botData.p1.r,
      }
      ws.send(JSON.stringify(data));
    }, 17)


  }
}
