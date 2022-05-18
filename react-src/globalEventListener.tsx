import { MENU_SHOW, MENU_HIDE } from "./actions";
import { uniqueId, hasOwnProp, canUseDOM } from "./helpers";

export type ShowOptions = {
  id: string;
  target: EventTarget;
  position?: { x: number; y: number };
};

export type HideOptions = { detail?: { id?: string } };

type ShowCallback = (event: CustomEvent<ShowOptions>) => void;
type HideCallback = (event: CustomEvent<HideOptions>) => void;

class GlobalEventListener {
  private callbacks: Record<
    string,
    {
      show: ShowCallback;
      hide: HideCallback;
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
        this.callbacks[id].show(event as CustomEvent<ShowOptions>);
    }
  };

  handleHideEvent = (event: Event) => {
    for (const id in this.callbacks) {
      if (hasOwnProp(this.callbacks, id))
        this.callbacks[id].hide(event as CustomEvent<HideOptions>);
    }
  };

  register = (showCallback: ShowCallback, hideCallback: HideCallback) => {
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

export const listener = new GlobalEventListener();
