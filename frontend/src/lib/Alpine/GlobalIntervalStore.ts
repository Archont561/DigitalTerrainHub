export default {
    interval: 1000,
    flag: true,

    stop() {
        if (this.intervalID !== null) {
            clearInterval(this.intervalID);
        }
    },
    init() {
        this.update();
        this.intervalID = setInterval(() => this.update(), this.interval);
    },
    update() {
        this.flag = !this.flag;
    },
    setIntervalValue(interval: number) {
        this.interval = interval;
    },
    resume() {
        this.intervalID = setInterval(() => this.update(), this.interval);
    }
} as alpine.GlobalIntervalStore;