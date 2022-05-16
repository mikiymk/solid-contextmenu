import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import assign from 'object-assign';

import { hideMenu } from './actions';
import { callIfExists, cssClasses, store } from './helpers';

export type MenuItemProps = {
    attributes?: React.HTMLAttributes<HTMLDivElement> & {
        disabledClassName: string;
        dividerClassName: string;
        selectedClassName: string;
    },
    className?: string;
    data?: Object,
    disabled?: boolean,
    divider?: boolean,
    preventClose?: boolean,
    onClick?: {(event: React.TouchEvent<HTMLDivElement> | React.MouseEvent<HTMLDivElement>, data: Object, target: HTMLElement): void},
}

type HiddenProps = {
    children: React.ReactNode,
    onMouseLeave: ()=>void,
    onMouseMove:  ()=>void,
    selected: boolean
}

export default class MenuItem extends Component<MenuItemProps & HiddenProps> {

    ref: HTMLDivElement | null | undefined;

    static propTypes = {
        attributes: PropTypes.object,
        children: PropTypes.node,
        className: PropTypes.string,
        data: PropTypes.object,
        disabled: PropTypes.bool,
        divider: PropTypes.bool,
        onClick: PropTypes.func,
        onMouseLeave: PropTypes.func,
        onMouseMove: PropTypes.func,
        preventClose: PropTypes.bool,
        selected: PropTypes.bool
    };

    static defaultProps = {
        attributes: {},
        children: null,
        className: '',
        data: {},
        disabled: false,
        divider: false,
        onClick() { return null; },
        onMouseMove: () => null,
        onMouseLeave: () => null,
        preventClose: false,
        selected: false
    };

    handleClick = (event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        if ("button" in event && event.button !== 0 && event.button !== 1) {
            event.preventDefault();
        }

        if (this.props.disabled || this.props.divider) return;

        callIfExists(
            this.props.onClick,
            event,
            assign({}, this.props.data, store.data),
            store.target!
        );

        if (this.props.preventClose) return;

        hideMenu();
    }

    render() {
        const {
            attributes,
            children,
            className,
            disabled,
            divider,
            selected
        } = this.props;

        const menuItemClassNames = cx(
            className,
            cssClasses.menuItem,
            attributes?.className,
            {
                [cx(cssClasses.menuItemDisabled, attributes?.disabledClassName)]: disabled,
                [cx(cssClasses.menuItemDivider, attributes?.dividerClassName)]: divider,
                [cx(cssClasses.menuItemSelected, attributes?.selectedClassName)]: selected
            }
        );

        return (
            <div
                {...attributes} className={menuItemClassNames}
                role='menuitem' tabIndex={-1} aria-disabled={disabled ? 'true' : 'false'}
                aria-orientation={divider ? 'horizontal' : undefined}
                ref={(ref) => { this.ref = ref; }}
                onMouseMove={this.props.onMouseMove} onMouseLeave={this.props.onMouseLeave}
                onTouchEnd={this.handleClick} onClick={this.handleClick}>
                {divider ? null : children}
            </div>
        );
    }
}
