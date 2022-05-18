import { useEffect } from "react";
import { HideOptions, listener, ShowOptions } from "../globalEventListener";

export const useRegisterListeners = (
  handleShow: (event: CustomEvent<ShowOptions>) => void,
  handleHide: (event: CustomEvent<HideOptions>) => void
) => {
  useEffect(() => {
    const listenId = listener.register(handleShow, handleHide);

    return () => {
      listenId && listener.unregister(listenId);
    };
  });
};
