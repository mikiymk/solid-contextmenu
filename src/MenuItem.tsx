import classnames from "classnames";

import { menuItem, menuItemDisabled, menuItemSelected } from "./cssClasses";

import { createRenderEffect, createSignal, JSX, useContext } from "solid-js";
import { MenuContext } from "./ContextMenu";
import { ProviderContext } from "./ContextMenuProvider";

export type MenuItemProps = {
  attributes?: JSX.HTMLAttributes<HTMLDivElement>;

  class?: string;
  disabledClass?: string;
  selectedClass?: string;

  disabled?: boolean;
  preventClose?: boolean;

  data: Object;
  onClick: (
    event: (MouseEvent | TouchEvent) & {
      currentTarget: HTMLDivElement;
      target: Element;
    },
    data: Object,
    target: JSX.Element
  ) => void;

  children?: JSX.Element;
};

export const MenuItem = (props: MenuItemProps) => {
  const [itemId, setItemId] = createSignal("");
  const menu = useContext(MenuContext);
  const provider = useContext(ProviderContext);

  createRenderEffect(() => {
    setItemId(menu.addItem());
  });

  const className = () =>
    classnames(props.class, menuItem, props.attributes?.class, {
      [classnames(menuItemDisabled, props.disabledClass)]: props.disabled,
      [classnames(menuItemSelected, props.selectedClass)]: menu.selected(
        itemId()
      ),
    });

  const handleClick: JSX.EventHandler<
    HTMLDivElement,
    MouseEvent | TouchEvent
  > = (event) => {
    if ("button" in event && event.button !== 0 && event.button !== 1) {
      event.preventDefault();
    }

    if (props.disabled) return;

    props.onClick &&
      props.onClick(
        event,
        { ...props.data, ...provider.data },
        provider.target
      );

    if (props.preventClose) return;

    provider.hideMenu();
  };

  return (
    <div
      {...props.attributes}
      class={className()}
      role="menuitem"
      tabIndex={-1}
      aria-disabled={props.disabled ? "true" : "false"}
      onMouseMove={menu.onMouseMove}
      onMouseLeave={menu.onMouseLeave}
      onTouchEnd={handleClick}
      onClick={handleClick}
    >
      {props.children}
    </div>
  );
};
