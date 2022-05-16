import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import assign from 'object-assign';

import { showMenu, hideMenu } from './actions';
import { callIfExists, cssClasses } from './helpers';

export type ContextMenuTriggerProps = {
    id: string,
    attributes?: React.HTMLAttributes<any>,
    collect?: {(data: any): any},
    disable?: boolean,
    holdToDisplay?: number,
    renderTag?: React.ElementType,
    mouseButton?: number,
    disableIfShiftIsPressed?: boolean,
    [key: string]: any
}

type HiddenProps = {
    children: React.ReactNode,
    posX: number,
    posY: number,
}

export default class ContextMenuTrigger extends Component<ContextMenuTriggerProps & HiddenProps> {
    static propTypes = {
        id: PropTypes.string.isRequired,
        children: PropTypes.node.isRequired,
        attributes: PropTypes.object,
        collect: PropTypes.func,
        disable: PropTypes.bool,
        holdToDisplay: PropTypes.number,
        posX: PropTypes.number,
        posY: PropTypes.number,
        renderTag: PropTypes.elementType,
        mouseButton: PropTypes.number,
        disableIfShiftIsPressed: PropTypes.bool
    };

    static defaultProps = {
        attributes: {},
        collect() { return null; },
        disable: false,
        holdToDisplay: 1000,
        renderTag: 'div',
        posX: 0,
        posY: 0,
        mouseButton: 2, // 0 is left click, 2 is right click
        disableIfShiftIsPressed: false
    };

    touchHandled = false;
    mouseDownTimeoutId: number | undefined;
    touchstartTimeoutId: number | undefined;

    elem: HTMLElement | null | undefined;

    handleMouseDown = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        const holdToDisplay = this.props.holdToDisplay ?? 1000
        if (holdToDisplay >= 0 && event.button === 0) {
            event.persist();
            event.stopPropagation();

            this.mouseDownTimeoutId = window.setTimeout(
                () => this.handleContextClick(event),
                holdToDisplay
            );
        }
        callIfExists(this.props.attributes?.onMouseDown, event);
    }

    handleMouseUp = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        if (event.button === 0) {
            clearTimeout(this.mouseDownTimeoutId);
        }
        callIfExists(this.props.attributes?.onMouseUp, event);
    }

    handleMouseOut = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        if (event.button === 0) {
            clearTimeout(this.mouseDownTimeoutId);
        }
        callIfExists(this.props.attributes?.onMouseOut, event);
    }

    handleTouchstart = (event: React.TouchEvent<HTMLElement>) => {
        this.touchHandled = false;
        const holdToDisplay = this.props.holdToDisplay ?? 1000

        if (holdToDisplay >= 0) {
            event.persist();
            event.stopPropagation();

            this.touchstartTimeoutId = window.setTimeout(
                () => {
                    this.handleContextClick(event);
                    this.touchHandled = true;
                },
                holdToDisplay
            );
        }
        callIfExists(this.props.attributes?.onTouchStart, event);
    }

    handleTouchEnd = (event: React.TouchEvent<HTMLElement>) => {
        if (this.touchHandled) {
            event.preventDefault();
        }
        clearTimeout(this.touchstartTimeoutId);
        callIfExists(this.props.attributes?.onTouchEnd, event);
    }

    handleContextMenu = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        if (event.button === this.props.mouseButton) {
            this.handleContextClick(event);
        }
        callIfExists(this.props.attributes?.onContextMenu, event);
    }

    handleMouseClick = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        if (event.button === this.props.mouseButton) {
            this.handleContextClick(event);
        }
        callIfExists(this.props.attributes?.onClick, event);
    }

    handleContextClick = (event: React.MouseEvent<HTMLElement, MouseEvent> | React.TouchEvent<HTMLElement>) => {
        if (this.props.disable) return;
        if (this.props.disableIfShiftIsPressed && event.shiftKey) return;

        event.preventDefault();
        event.stopPropagation();

        let x = "clientX" in event ? event.clientX : (event.touches && event.touches[0].pageX);
        let y = "clientY" in event ? event.clientY : (event.touches && event.touches[0].pageY);

        if (this.props.posX) {
            x -= this.props.posX;
        }
        if (this.props.posY) {
            y -= this.props.posY;
        }

        hideMenu();

        let data = callIfExists(this.props.collect, this.props);
        let showMenuConfig: {
            position: {
                x: any;
                y: any;
            };
            target: HTMLElement | null | undefined;
            id: string;
            data?: any;
        } = {
            position: { x, y },
            target: this.elem,
            id: this.props.id
        };
        if (data && (typeof data.then === 'function') && data instanceof Promise) {
            // it's promise
            data.then((resp) => {
                showMenuConfig.data = assign({}, resp, {
                    target: event.target
                });
                showMenu(showMenuConfig);
            });
        } else {
            showMenuConfig.data = assign({}, data, {
                target: event.target
            });
            showMenu(showMenuConfig);
        }
    }

    elemRef = (c: HTMLElement | null) => {
        this.elem = c;
    }

    render() {
        const { renderTag, attributes, children } = this.props;
        const newAttrs = assign({}, attributes, {
            className: cx(cssClasses.menuWrapper, attributes?.className),
            onContextMenu: this.handleContextMenu,
            onClick: this.handleMouseClick,
            onMouseDown: this.handleMouseDown,
            onMouseUp: this.handleMouseUp,
            onTouchStart: this.handleTouchstart,
            onTouchEnd: this.handleTouchEnd,
            onMouseOut: this.handleMouseOut,
            ref: this.elemRef
        });

        return React.createElement(renderTag ?? "div", newAttrs, children);
    }
}
