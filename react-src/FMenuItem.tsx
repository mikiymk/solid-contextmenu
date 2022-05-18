import React, { useContext, useRef } from "react";
import cx from "classnames";
import assign from "object-assign";

import { hideMenu } from "./actions";
import { callIfExists, cssClasses, store } from "./helpers";
import { Context } from "./FMenuContext";

export type MenuItemProps = {
  attributes?: React.HTMLAttributes<HTMLDivElement> & {
    disabledClassName: string;
    dividerClassName: string;
    selectedClassName: string;
  };
  className?: string;
  data?: Object;
  disabled?: boolean;
  divider?: boolean;
  preventClose?: boolean;
  onClick?: {
    (
      event:
        | React.TouchEvent<HTMLDivElement>
        | React.MouseEvent<HTMLDivElement>,
      data: Object,
      target: HTMLElement
    ): void;
  };

  children: React.ReactNode;
};

export const MenuItem: React.FC<MenuItemProps> = (props) => {
  const value = useContext(Context);
  const ref = useRef<HTMLDivElement>(null);

  const className = cx(
    props.className,
    cssClasses.menuItem,
    props.attributes?.className,
    {
      [cx(cssClasses.menuItemDisabled, props.attributes?.disabledClassName)]:
        props.disabled,
      [cx(cssClasses.menuItemDivider, props.attributes?.dividerClassName)]:
        props.divider,
      [cx(cssClasses.menuItemSelected, props.attributes?.selectedClassName)]:
        !props.divider && value.selected(this),
    }
  );

  const handleClick = (
    event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>
  ) => {
    if ("button" in event && event.button !== 0 && event.button !== 1) {
      event.preventDefault();
    }

    if (props.disabled || props.divider) return;

    callIfExists(
      props.onClick,
      event,
      assign({}, props.data, store.data),
      store.target!
    );

    if (props.preventClose) return;

    hideMenu();
  };

  return (
    <div
      {...props.attributes}
      className={className}
      role="menuitem"
      tabIndex={-1}
      aria-disabled={props.disabled ? "true" : "false"}
      aria-orientation={props.divider ? "horizontal" : undefined}
      ref={ref}
      onMouseMove={value.onMouseMove}
      onMouseLeave={value.onMouseLeave}
      onTouchEnd={handleClick}
      onClick={handleClick}
    >
      {props.divider ? null : props.children}
    </div>
  );
};
