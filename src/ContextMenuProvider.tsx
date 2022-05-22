import { createContext, createSignal, JSXElement, Show } from "solid-js";

import { noImplement } from "./helper";

export type ProviderContextType = {
  data: () => any;
  target: () => Element | undefined;

  showMenu: () => void;
  hideMenu: () => void;
};

export const ProviderContext = createContext<ProviderContextType>({
  data: noImplement,
  target: noImplement,
  showMenu: noImplement,
  hideMenu: noImplement,
});

export type ContextMenuProviderProps = {
  menu: JSXElement;

  children: JSXElement;
};

export const ContextMenuProvider = (props: ContextMenuProviderProps) => {
  const [visible, setVisible] = createSignal(false);
  const [data, setData] = createSignal();
  const [target, setTarget] = createSignal<Element>();
  const showMenu = () => {
    setVisible(true);
  };

  const hideMenu = () => {
    setVisible(false);
  };
  return (
    <ProviderContext.Provider
      value={{
        showMenu,
        hideMenu,
        data,
        target,
      }}
    >
      <Show when={visible()}>{props.menu}</Show>
      <div
        oncontextmenu={(event) => {
          setData(event.currentTarget.dataset);
          setTarget(event.target);
        }}
      >
        {props.children}
      </div>
    </ProviderContext.Provider>
  );
};
