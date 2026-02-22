export const FRAME_REPLAY_HELPER = `
(() => {
  const listeners = new Set();

  const runListeners = () => {
    for (const listener of Array.from(listeners)) {
      try {
        listener();
      } catch (error) {
        console.error("demo replay listener failed", error);
      }
    }
  };

  const replayAnimations = (root = document.getElementById("demo-root")) => {
    if (!root) return;

    const nodes = [root, ...Array.from(root.querySelectorAll("*"))];
    const uniqueAnimations = new Set();

    for (const node of nodes) {
      if (typeof node.getAnimations !== "function") continue;
      for (const animation of node.getAnimations()) {
        uniqueAnimations.add(animation);
      }
    }

    for (const animation of uniqueAnimations) {
      animation.cancel();
      animation.play();
    }
  };

  const handleReplaySignal = () => {
    replayAnimations();
    runListeners();
  };

  const targets = [window, document, document.getElementById("demo-root")];
  for (const target of targets) {
    target?.addEventListener("demo:replay", handleReplaySignal);
  }
  window.addEventListener("message", (event) => {
    if (event.data?.type !== "demo:replay") return;
    handleReplaySignal();
  });

  window.demoReplay = Object.freeze({
    onReplay(listener) {
      if (typeof listener !== "function") {
        return () => {};
      }

      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    replayAnimations,
  });
})();
`;
