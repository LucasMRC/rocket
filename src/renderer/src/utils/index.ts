let timeout;

export function formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    function addLeadingZero(number: number): string {
        if (number < 10) return `0${number}`;
        return number.toString();
    };

    return `${addLeadingZero(hours)}:${addLeadingZero(minutes)}:${addLeadingZero(remainingSeconds)}`;
}

export function createInterval(callback: (args?: unknown) => unknown, duration: number) {
    let lastTime = Date.now();
    let lastDelay = duration;

    function tick() {
        const now = Date.now();
        const dTime = now - lastTime;
        lastTime = now;
        lastDelay = duration + lastDelay - dTime;
        timeout = setTimeout(tick, lastDelay);
        callback();
    }
    callback();
    timeout = setTimeout(tick, duration);
}

export function deleteInterval() {
    if (timeout) clearTimeout(timeout);
}
