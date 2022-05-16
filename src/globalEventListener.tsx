import { MENU_SHOW, MENU_HIDE } from "./actions";
import { uniqueId, hasOwnProp, canUseDOM } from "./helpers";

type EventCallback = (event: CustomEvent) => void;

class GlobalEventListener {
  private callbacks: Record<
    string,
    {
      show: EventCallback;
      hide: EventCallback;
    }
  >;

  constructor() {
    this.callbacks = {};

    if (canUseDOM) {
      window.addEventListener(MENU_SHOW, this.handleShowEvent);
      window.addEventListener(MENU_HIDE, this.handleHideEvent);
    }
  }

  handleShowEvent = (event: Event) => {
    for (const id in this.callbacks) {
      if (hasOwnProp(this.callbacks, id))
        this.callbacks[id].show(event as CustomEvent);
    }
  };

  handleHideEvent = (event: Event) => {
    for (const id in this.callbacks) {
      if (hasOwnProp(this.callbacks, id))
        this.callbacks[id].hide(event as CustomEvent);
    }
  };

  register = (showCallback: EventCallback, hideCallback: EventCallback) => {
    const id = uniqueId();

    this.callbacks[id] = {
      show: showCallback,
      hide: hideCallback,
    };

    return id;
  };

  unregister = (id: string) => {
    if (id && this.callbacks[id]) {
      delete this.callbacks[id];
    }
  };
}

export default new GlobalEventListener();
