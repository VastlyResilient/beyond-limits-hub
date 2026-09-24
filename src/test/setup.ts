/* jsdom does not implement ResizeObserver. Both Tip and InfoButton measure
   their bubble with one to keep it inside the panel that clips it, so without
   this stub any test that opens a tooltip throws during the layout effect.
   The stub records observers so a test can trigger a re-measure if it cares. */
class RO {
  static instances: RO[] = [];
  cb: ResizeObserverCallback;
  constructor(cb: ResizeObserverCallback) { this.cb = cb; RO.instances.push(this); }
  observe() {}
  unobserve() {}
  disconnect() {}
  trigger() { this.cb([], this as unknown as ResizeObserver); }
}
(globalThis as any).ResizeObserver = (globalThis as any).ResizeObserver || RO;
