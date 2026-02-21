interface ViewTransition {
  finished: Promise<void>;
  ready: Promise<void>;
  updateCallbackDone: Promise<void>;
  skipTransition(): void;
}

interface StartViewTransitionOptions {
  update: () => void | Promise<void>;
  types?: string[];
}

interface Document {
  startViewTransition?(
    updateCallback: (() => void | Promise<void>) | StartViewTransitionOptions
  ): ViewTransition;
}
