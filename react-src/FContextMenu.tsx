import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import cx from "classnames";
import assign from "object-assign";
import { v4 } from "uuid";

import { listener } from "./globalEventListener";
import { AbstractMenu, AbstractMenuProps } from "./AbstractMenu";
import { SubMenu } from "./SubMenu";
import { hideMenu } from "./actions";
import { cssClasses, callIfExists, store } from "./helpers";
import { Context } from "./FMenuContext";
import { useMenuItem } from "./hooks/useMenuItem";
import { useRegisterListeners } from "./hooks/useRegisterListeners";

export type ContextMenuStates = {
  x: number;
  y: number;
  isVisible: boolean;
};

type ContextMenuProps = {
  id: string;
  data?: Object;
  className?: string;
  hideOnLeave?: boolean;
  rtl?: boolean;
  onHide?: { (event: any): void };
  onMouseLeave?: {
    (
      event: React.MouseEvent<HTMLElement>,
      data: Object,
      target: HTMLElement
    ): void;
  };
  onShow?: { (event: any): void };
  preventHideOnContextMenu?: boolean;
  preventHideOnResize?: boolean;
  preventHideOnScroll?: boolean;
  style?: React.CSSProperties;

  children: React.ReactNode;
};

export const ContextMenu: React.FC<ContextMenuProps> = (props) => {
  {
    const [isVisible, setIsVisible] = useState(false);
    const [x, setX] = useState(0);
    const [y, setY] = useState(0);

    const [childItemIds, setChildItemIds] = useState<string[]>([]);
    const addChildItem = () => {
      const childItemId = v4();
      setChildItemIds((childItemIds) => [...childItemIds, childItemId]);
      return childItemId;
    };

    const removeChildItem = (childItemId: string) => {
      const remove = (childItemIds: string[]) => {
        const index = childItemIds.indexOf(childItemId);
        if (index === -1) {
          return childItemIds;
        } else {
          return childItemIds
            .slice(0, index)
            .concat(childItemIds.slice(index + 1));
        }
      };
      setChildItemIds(remove);
    };

    const {
      selectedItemId,
      setSelectedItemId,
      forceSubMenuOpen,
      setForceSubMenuOpen,
      onChildMouseLeave,
      onChildMouseMove,
    } = useMenuItem();

    const handleShow = (event: {
      detail: { id?: string; position?: { x: number; y: number } };
    }) => {
      if (event.detail.id !== props.id || isVisible) return;

      const { x, y } = event.detail.position;

      setIsVisible(true);
      setX(event.detail.position?.x ?? 0);
      setX(event.detail.position?.x ?? 0);

      this.registerHandlers();
      callIfExists(props.onShow, event);
    };

    const handleHide = (e: { detail?: { id?: string } | number }) => {
      if (
        this.state.isVisible &&
        (!e.detail ||
          typeof e.detail === "number" ||
          !e.detail.id ||
          e.detail.id === this.props.id)
      ) {
        this.unregisterHandlers();
        this.setState({
          isVisible: false,
          selectedItem: null,
          forceSubMenuOpen: false,
        });
        callIfExists(this.props.onHide, e);
      }
    };

    useRegisterListeners(handleShow, handleHide);
    useEffect(() => () => this.unregisterHandlers());

    const hide = (event: any) => {
      this.unregisterHandlers();
      setIsVisible(false);
      setSelectedItemId(undefined);
      setForceSubMenuOpen(false);

      callIfExists(props.onHide, event);
    };

    /**
     * callback function when trying to open the context menu.
     * if you operate on an opened menu, the menu will be closed.
     * @param event mouse event
     */
    const handleContextMenu = (event: React.MouseEvent<HTMLElement>) => {
      if (process.env.NODE_ENV === "production") {
        event.preventDefault();
      }
      hide(event);
    };

    const handleMouseLeave = (event: React.MouseEvent<HTMLElement>) => {
      event.preventDefault();

      callIfExists(
        props.onMouseLeave,
        event,
        assign({}, props.data, store.data),
        store.target!
      );

      if (props.hideOnLeave) hideMenu();
    };

    return (
      <Context.Provider
        value={{
          // onMouseMove is only needed for non selected items
          addChildItem: () => addChildItem(),
          onMouseMove: (childId) => onChildMouseMove(childId),
          onMouseLeave: () => onChildMouseLeave(),

          // special props for SubMenu only
          forceOpen: (childId) =>
            forceSubMenuOpen && selectedItemId === childId,
          forceClose: () => this.handleForceClose(),
          parentKeyNavigationHandler: (event: KeyboardEvent) =>
            this.handleKeyNavigation(event),

          // special props for selected item only
          selected: (child?: string) =>
            !!selectedItemId && selectedItemId === child,
          ref: (ref: React.ReactElement | null) => {
            this.seletedItemRef = ref;
          },
        }}
      >
        <nav
          role="menu"
          tabIndex={-1}
          ref={this.menuRef}
          style={{
            ...props.style,
            ...{
              position: "fixed",
              opacity: 0,
              pointerEvents: "none",
            },
          }}
          className={cx(cssClasses.menu, props.className, {
            [cssClasses.menuVisible]: isVisible,
          })}
          onContextMenu={handleContextMenu}
          onMouseLeave={handleMouseLeave}
        >
          {props.children}
        </nav>
      </Context.Provider>
    );
  }
};

export class ContextMenu extends AbstractMenu<
  ContextMenuProps,
  ContextMenuStates
> {
  listenId: string | undefined;
  menu: HTMLElement | null | undefined;

  static propTypes = {
    id: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
    data: PropTypes.object,
    className: PropTypes.string,
    hideOnLeave: PropTypes.bool,
    rtl: PropTypes.bool,
    onHide: PropTypes.func,
    onMouseLeave: PropTypes.func,
    onShow: PropTypes.func,
    preventHideOnContextMenu: PropTypes.bool,
    preventHideOnResize: PropTypes.bool,
    preventHideOnScroll: PropTypes.bool,
    style: PropTypes.object,
  };

  static defaultProps = {
    className: "",
    data: {},
    hideOnLeave: false,
    rtl: false,
    onHide() {
      return null;
    },
    onMouseLeave() {
      return null;
    },
    onShow() {
      return null;
    },
    preventHideOnContextMenu: false,
    preventHideOnResize: false,
    preventHideOnScroll: false,
    style: {},
  };

  constructor(props: ContextMenuProps & AbstractMenuProps) {
    super(props);

    this.state = assign({}, this.state, {
      x: 0,
      y: 0,
      isVisible: false,
    });
  }

  getSubMenuType() {
    // eslint-disable-line class-methods-use-this
    return SubMenu;
  }

  componentDidUpdate() {
    const wrapper = window.requestAnimationFrame || setTimeout;
    if (this.state.isVisible) {
      wrapper(() => {
        const { x, y } = this.state;

        const { top, left } = this.props.rtl
          ? this.getRTLMenuPosition(x, y)
          : this.getMenuPosition(x, y);

        wrapper(() => {
          if (!this.menu) return;
          this.menu.style.top = `${top}px`;
          this.menu.style.left = `${left}px`;
          this.menu.style.opacity = "1";
          this.menu.style.pointerEvents = "auto";
        });
      });
    } else {
      wrapper(() => {
        if (!this.menu) return;
        this.menu.style.opacity = "0";
        this.menu.style.pointerEvents = "none";
      });
    }
  }

  registerHandlers = () => {
    document.addEventListener("mousedown", this.handleOutsideClick);
    document.addEventListener("touchstart", this.handleOutsideClick);
    if (!this.props.preventHideOnScroll)
      document.addEventListener("scroll", this.handleHide);
    if (!this.props.preventHideOnContextMenu)
      document.addEventListener("contextmenu", this.handleHide);
    document.addEventListener("keydown", this.handleKeyNavigation);
    if (!this.props.preventHideOnResize)
      window.addEventListener("resize", this.handleHide);
  };

  unregisterHandlers = () => {
    document.removeEventListener("mousedown", this.handleOutsideClick);
    document.removeEventListener("touchstart", this.handleOutsideClick);
    document.removeEventListener("scroll", this.handleHide);
    document.removeEventListener("contextmenu", this.handleHide);
    document.removeEventListener("keydown", this.handleKeyNavigation);
    window.removeEventListener("resize", this.handleHide);
  };

  handleOutsideClick = (e: Event) => {
    if (!this.menu?.contains(e.target as Node)) hideMenu();
  };

  hideMenu = (e: KeyboardEvent) => {
    if (e.keyCode === 27 || e.keyCode === 13) {
      // ECS or enter
      hideMenu();
    }
  };

  getMenuPosition = (x = 0, y = 0) => {
    let menuStyles = {
      top: y,
      left: x,
    };

    if (!this.menu) return menuStyles;

    const { innerWidth, innerHeight } = window;
    const rect = this.menu.getBoundingClientRect();

    if (y + rect.height > innerHeight) {
      menuStyles.top -= rect.height;
    }

    if (x + rect.width > innerWidth) {
      menuStyles.left -= rect.width;
    }

    if (menuStyles.top < 0) {
      menuStyles.top =
        rect.height < innerHeight ? (innerHeight - rect.height) / 2 : 0;
    }

    if (menuStyles.left < 0) {
      menuStyles.left =
        rect.width < innerWidth ? (innerWidth - rect.width) / 2 : 0;
    }

    return menuStyles;
  };

  getRTLMenuPosition = (x = 0, y = 0) => {
    let menuStyles = {
      top: y,
      left: x,
    };

    if (!this.menu) return menuStyles;

    const { innerWidth, innerHeight } = window;
    const rect = this.menu.getBoundingClientRect();

    // Try to position the menu on the left side of the cursor
    menuStyles.left = x - rect.width;

    if (y + rect.height > innerHeight) {
      menuStyles.top -= rect.height;
    }

    if (menuStyles.left < 0) {
      menuStyles.left += rect.width;
    }

    if (menuStyles.top < 0) {
      menuStyles.top =
        rect.height < innerHeight ? (innerHeight - rect.height) / 2 : 0;
    }

    if (menuStyles.left + rect.width > innerWidth) {
      menuStyles.left =
        rect.width < innerWidth ? (innerWidth - rect.width) / 2 : 0;
    }

    return menuStyles;
  };

  menuRef = (c: HTMLElement | null) => {
    this.menu = c;
  };
}
