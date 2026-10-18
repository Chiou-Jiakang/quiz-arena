/**
 * Quiz Arena v0.3.0: one-shot, deadline-based question clock.
 * Scheduler/clock injection makes lifecycle and deadline behavior testable.
 */
export const QUESTION_SECONDS = 20;

export function createQuestionTimer({
  seconds = QUESTION_SECONDS,
  onTick,
  onExpire,
  now = () => performance.now(),
  setIntervalFn = (callback, interval) => setInterval(callback, interval),
  clearIntervalFn = id => clearInterval(id)
} = {}) {
  if (!Number.isFinite(seconds) || seconds <= 0) throw new RangeError('倒數秒數必須為正數');
  if (typeof onTick !== 'function' || typeof onExpire !== 'function') throw new TypeError('缺少計時回呼');
  if ([now, setIntervalFn, clearIntervalFn].some(fn => typeof fn !== 'function')) throw new TypeError('計時器依賴必須為函式');

  let intervalId = null;
  let deadline = null;
  let active = false;
  let expired = false;

  function stop() {
    active = false;
    if (intervalId !== null) {
      clearIntervalFn(intervalId);
      intervalId = null;
    }
  }

  function remainingMs() {
    if (deadline === null) return seconds * 1000;
    return Math.max(0, deadline - now());
  }

  function isExpired() {
    return deadline !== null && (expired || remainingMs() <= 0);
  }

  function tick() {
    if (!active) return;
    const ms = remainingMs();
    onTick(Math.ceil(ms / 1000), ms / (seconds * 1000));
    if (ms <= 0) {
      expired = true;
      stop();
      onExpire();
    }
  }

  function start() {
    stop();
    expired = false;
    deadline = now() + seconds * 1000;
    active = true;
    tick();
    if (active) intervalId = setIntervalFn(tick, 100);
  }

  return { start, stop, tick, isExpired, remainingMs, get active() { return active; } };
}
