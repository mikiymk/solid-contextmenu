import { JSX, useContext } from "solid-js";
import classnames from "classnames";

import { MenuContext } from "./ContextMenu";
import { menuItem, menuItemDivider } from "./cssClasses";

export type MenuItemProps = {
  attributes?: JSX.HTMLAttributes<HTMLDivElement>;

  class?: string;
  dividerClass?: string;

  disabled?: boolean;
};

export const MenuItem = (props: MenuItemProps) => {
  const menu = useContext(MenuContext);

  const className = () =>
    classnames(
      props.class,
      menuItem,
      props.attributes?.class,
      menuItemDivider,
      props.dividerClass
    );

  const handleClick: JSX.EventHandler<
    HTMLDivElement,
    MouseEvent | TouchEvent
  > = (event) => {
    if ("button" in event && event.button !== 0 && event.button !== 1) {
      event.preventDefault();
    }
  };

  return (
    <div
      {...props.attributes}
      class={className()}
      role="menuitem"
      tabIndex={-1}
      aria-disabled={props.disabled ? "true" : "false"}
      aria-orientation={"horizontal"}
      onMouseMove={menu.onMouseMove}
      onMouseLeave={menu.onMouseLeave}
      onTouchEnd={handleClick}
      onClick={handleClick}
    ></div>
  );
};
