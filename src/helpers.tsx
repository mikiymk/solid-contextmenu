export function callIfExists<F extends (...args:any) => any>(func?:F, ...args: Parameters<F>) : ReturnType<F>{   
    return (typeof func === 'function') && func(...args as any[]);
}

export function hasOwnProp<Key extends PropertyKey>(obj: any, prop: Key): obj is {[prop in Key]: any} {
    return Object.prototype.hasOwnProperty.call(obj, prop);
}

export function uniqueId() {
    return Math.random().toString(36).substring(7);
}

export const cssClasses = {
    menu: 'react-contextmenu',
    menuVisible: 'react-contextmenu--visible',
    menuWrapper: 'react-contextmenu-wrapper',
    menuItem: 'react-contextmenu-item',
    menuItemActive: 'react-contextmenu-item--active',
    menuItemDisabled: 'react-contextmenu-item--disabled',
    menuItemDivider: 'react-contextmenu-item--divider',
    menuItemSelected: 'react-contextmenu-item--selected',
    subMenu: 'react-contextmenu-submenu'
};

export const store: {
    data?: Object;
    target?: HTMLElement;
} = {};

export const canUseDOM = Boolean(
    typeof window !== 'undefined' && window.document && window.document.createElement
);
