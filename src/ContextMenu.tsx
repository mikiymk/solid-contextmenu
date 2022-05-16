import React from "react";
import PropTypes from "prop-types";
import cx from "classnames";
import assign from "object-assign";

import listener from "./globalEventListener";
import AbstractMenu, { AbstractMenuProps } from "./AbstractMenu";
import SubMenu from "./SubMenu";
import { hideMenu } from "./actions";
import { cssClasses, callIfExists, store } from "./helpers";
import { Context } from "./ReactContextAPI";

export type ContextMenuStates = {
  x: number;
  y: number;
  isVisible: boolean;
};

type ContextMenuProps = {
  id: string;
  data?: any;
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
};

export default class ContextMenu extends AbstractMenu<
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

  componentDidMount() {
    this.listenId = listener.register(this.handleShow, this.handleHide);
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

  componentWillUnmount() {
    if (this.listenId) {
      listener.unregister(this.listenId);
    }

    this.unregisterHandlers();
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

  handleShow = (e: {
    detail: { id: string; position: { x: number; y: number } };
  }) => {
    if (e.detail.id !== this.props.id || this.state.isVisible) return;

    const { x, y } = e.detail.position;

    this.setState({ isVisible: true, x, y });
    this.registerHandlers();
    callIfExists(this.props.onShow, e);
  };

  handleHide = (e: { detail?: { id?: string } | number }) => {
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

  handleOutsideClick = (e: Event) => {
    if (!this.menu?.contains(e.target as Node)) hideMenu();
  };

  handleMouseLeave = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
    event.preventDefault();

    callIfExists(
      this.props.onMouseLeave,
      event,
      assign({}, this.props.data, store.data),
      store.target!
    );

    if (this.props.hideOnLeave) hideMenu();
  };

  handleContextMenu = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    if (process.env.NODE_ENV === "production") {
      e.preventDefault();
    }
    this.handleHide(e);
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

  render() {
    const { children, className, style } = this.props;
    const { isVisible } = this.state;
    const inlineStyle = assign({}, style, {
      position: "fixed",
      opacity: 0,
      pointerEvents: "none",
    });
    const menuClassnames = cx(cssClasses.menu, className, {
      [cssClasses.menuVisible]: isVisible,
    });

    return (
      <Context.Provider
        value={{
          onMouseLeave: () => this.onChildMouseLeave(),

          // onMouseMove is only needed for non selected items
          onMouseMove: (child: any) => this.onChildMouseMove(child),

          // special props for SubMenu only
          forceOpen: (child: any) =>
            this.state.forceSubMenuOpen && this.state.selectedItem === child,
          forceClose: () => this.handleForceClose(),
          parentKeyNavigationHandler: (event: KeyboardEvent) =>
            this.handleKeyNavigation(event),

          // special props for selected item only
          selected: (child: any) =>
            !child.props.divider && this.state.selectedItem === child,
          ref: (ref: React.ReactElement | null) => {
            this.seletedItemRef = ref;
          },
        }}
      >
        <nav
          role="menu"
          tabIndex={-1}
          ref={this.menuRef}
          style={inlineStyle}
          className={menuClassnames}
          onContextMenu={this.handleContextMenu}
          onMouseLeave={this.handleMouseLeave}
        >
          {this.renderChildren(children)}
        </nav>
      </Context.Provider>
    );
  }
}
