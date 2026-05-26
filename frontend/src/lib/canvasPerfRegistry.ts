type CanvasPerfCallback = (fps: number) => void;

const registry = new Map<string, CanvasPerfCallback>();
let animFrameId = 0;
let lastTime = 0;
let frameCount = 0;

function measureLoop(now: number) {
  frameCount++;
  const delta = now - lastTime;
  if (delta >= 1000) {
    const fps = Math.round((frameCount * 1000) / delta);
    registry.forEach((cb) => cb(fps));
    frameCount = 0;
    lastTime = now;
  }
  animFrameId = requestAnimationFrame(measureLoop);
}

export function setCanvasPerf(idOrData: string | Record<string, unknown>, callback?: CanvasPerfCallback): void {
  if (typeof idOrData === 'string' && callback) {
    registry.set(idOrData, callback);
    if (!animFrameId) {
      lastTime = performance.now();
      animFrameId = requestAnimationFrame(measureLoop);
    }
  }
}

export function removeCanvasPerf(id: string): void {
  registry.delete(id);
  if (registry.size === 0 && animFrameId) {
    cancelAnimationFrame(animFrameId);
    animFrameId = 0;
  }
}
