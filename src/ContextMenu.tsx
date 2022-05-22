import { createContext, createSignal, JSXElement } from "solid-js";

import { noImplement } from "./helper";

export type MenuContextType = {
  addItem: () => string;
  selected: (itemId: string) => boolean;

  onMouseMove: () => void;
  onMouseLeave: () => void;
};

export const MenuContext = createContext<MenuContextType>({
  addItem: noImplement,
  selected: noImplement,
  onMouseMove: noImplement,
  onMouseLeave: noImplement,
});

export type ContextMenuProps = {
  children: JSXElement;
};

export const ContextMenu = (props: ContextMenuProps) => {
  const [itemIds, setItemIds] = createSignal<string[]>([]);
  const [selectedId, setSelectedId] = createSignal("");
  const addItem = () => {
    const itemId = Math.random().toString(16).substring(2);
    setItemIds((prev) => prev.concat([itemId]));
    return itemId;
  };
  const selected = (itemId: string) => {
    return itemId === selectedId();
  };
  const onMouseMove = () => {};
  const onMouseLeave = () => {};

  return (
    <MenuContext.Provider
      value={{
        addItem,
        selected,
        onMouseMove,
        onMouseLeave,
      }}
    >
      <div>{props.children}</div>
    </MenuContext.Provider>
  );
};
