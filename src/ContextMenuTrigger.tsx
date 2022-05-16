import React, { useRef } from "react";
import cx from "classnames";

import { showMenu, hideMenu } from "./actions";
import { callIfExists, cssClasses } from "./helpers";

export type ContextMenuTriggerProps = {
  id: string;
  attributes?: React.HTMLAttributes<any>;
  collect?: { (data: any): any };
  disable?: boolean;
  holdToDisplay?: number;
  mouseButton?: number;
  disableIfShiftIsPressed?: boolean;
  [key: string]: any;
};

type HiddenProps = {
  children: React.ReactNode;
  posX?: number;
  posY?: number;
};

export const ContextMenuTrigger: React.FC<
  ContextMenuTriggerProps & HiddenProps
> = (props) => {
  const touchHandled = useRef(false);
  const mouseDownTimeoutId = useRef(0);
  const touchstartTimeoutId = useRef(0);
  const elem = useRef<HTMLDivElement>(null);

  const handleContextClick = (
    event:
      | React.MouseEvent<HTMLElement, MouseEvent>
      | React.TouchEvent<HTMLElement>
  ) => {
    if (props.disable) return;
    if (props.disableIfShiftIsPressed && event.shiftKey) return;

    event.preventDefault();
    event.stopPropagation();

    let x =
      "clientX" in event
        ? event.clientX
        : event.touches && event.touches[0].pageX;
    let y =
      "clientY" in event
        ? event.clientY
        : event.touches && event.touches[0].pageY;

    if (props.posX) {
      x -= props.posX;
    }
    if (props.posY) {
      y -= props.posY;
    }

    hideMenu();

    let data = callIfExists(props.collect, props);
    type Option = {
      position: { x: number; y: number };
      target: HTMLDivElement | null;
      id: string;
      data?: any;
    };

    let showMenuConfig: Option = {
      position: { x, y },
      target: elem.current,
      id: props.id,
    };
    if (data instanceof Promise) {
      // it's promise
      data.then((data) => {
        showMenuConfig.data = {
          ...data,
          target: event.target,
        };
        showMenu(showMenuConfig);
      });
    } else {
      showMenuConfig.data = {
        ...data,
        target: event.target,
      };
      showMenu(showMenuConfig);
    }
  };

  const handleContextMenu: React.MouseEventHandler<HTMLDivElement> = (
    event
  ) => {
    if (event.button === (props.mouseButton ?? 2)) {
      handleContextClick(event);
    }
    callIfExists(props.attributes?.onContextMenu, event);
  };

  const handleMouseClick: React.MouseEventHandler<HTMLDivElement> = (event) => {
    if (event.button === (props.mouseButton ?? 2)) {
      handleContextClick(event);
    }
    callIfExists(props.attributes?.onClick, event);
  };

  const handleMouseDown: React.MouseEventHandler<HTMLDivElement> = (event) => {
    const holdToDisplay = props.holdToDisplay ?? 1000;
    if (holdToDisplay >= 0 && event.button === 0) {
      event.persist();
      event.stopPropagation();

      mouseDownTimeoutId.current = window.setTimeout(
        () => handleContextClick(event),
        holdToDisplay
      );
    }
    callIfExists(props.attributes?.onMouseDown, event);
  };

  const handleMouseUp: React.MouseEventHandler<HTMLDivElement> = (event) => {
    if (event.button === 0) {
      clearTimeout(mouseDownTimeoutId.current);
    }
    callIfExists(props.attributes?.onMouseUp, event);
  };

  const handleTouchstart: React.TouchEventHandler<HTMLDivElement> = (event) => {
    touchHandled.current = false;
    const holdToDisplay = props.holdToDisplay ?? 1000;

    if (holdToDisplay >= 0) {
      event.persist();
      event.stopPropagation();

      touchstartTimeoutId.current = window.setTimeout(() => {
        handleContextClick(event);
        touchHandled.current = true;
      }, holdToDisplay);
    }
    callIfExists(props.attributes?.onTouchStart, event);
  };

  const handleTouchEnd: React.TouchEventHandler<HTMLDivElement> = (event) => {
    if (touchHandled.current) {
      event.preventDefault();
    }
    clearTimeout(touchstartTimeoutId.current);
    callIfExists(props.attributes?.onTouchEnd, event);
  };

  const handleMouseOut: React.MouseEventHandler<HTMLDivElement> = (event) => {
    if (event.button === 0) {
      clearTimeout(mouseDownTimeoutId.current);
    }
    callIfExists(props.attributes?.onMouseOut, event);
  };

  return (
    <div
      {...props.attributes}
      className={cx(cssClasses.menuWrapper, props.attributes?.className)}
      onContextMenu={handleContextMenu}
      onClick={handleMouseClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchstart}
      onTouchEnd={handleTouchEnd}
      onMouseOut={handleMouseOut}
      ref={elem}
    >
      {props.children}
    </div>
  );
};
