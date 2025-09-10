class ServerSim {
  constructor() {
    this.currentRound = null;
    this.countdown = 15;
    this.timer = null;
    this.callbacks = {
      onRoundStart: [],
      onRoundEnd: [],
      onCountdownTick: []
    };
  }

  on(event, callback) {
    if (this.callbacks[event]) {
      this.callbacks[event].push(callback);
    }
  }

  startCountdown() {
    this.countdown = 15;
    this.updateCountdown();

    this.timer = setInterval(() => {
      this.countdown--;
      this.updateCountdown();

      if (this.countdown <= 0) {
        this.startRound();
      }
    }, 1000);
  }

  updateCountdown() {
    this.callbacks.onCountdownTick.forEach(cb => cb(this.countdown));
  }

  startRound() {
    clearInterval(this.timer);
    const crashPoint = 1 + Math.random() * (Math.random() > 0.7 ? 20 : 5);
    this.currentRound = {
      startTime: Date.now(),
      crashPoint: crashPoint,
      isActive: true
    };

    this.callbacks.onRoundStart.forEach(cb => cb(this.currentRound));

    const maxDuration = 325 * ((crashPoint - 1) / 0.05);
    setTimeout(() => {
      if (this.currentRound && this.currentRound.isActive) {
        this.endRound();
      }
    }, maxDuration + 1000);
  }

  endRound() {
    if (!this.currentRound) return;
    this.currentRound.isActive = false;
    this.callbacks.onRoundEnd.forEach(cb => cb(this.currentRound));
    setTimeout(() => this.startCountdown(), 5000);
  }
}

window.ServerSim = ServerSim;