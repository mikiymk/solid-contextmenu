import { createContext } from "react";

type Child = any;
export const Context = createContext<{
  onMouseLeave: () => any;
  // special props for SubMenu only
  forceOpen: (child: Child) => any;
  forceClose: () => any;
  parentKeyNavigationHandler: (event: KeyboardEvent) => any;
  // special props for selected item only
  selected: (child: Child) => boolean;
  ref: (ref: React.ReactElement | null) => void;
  // onMouseMove is only needed for non selected items
  onMouseMove: (child: Child) => any;
}>({
  onMouseLeave: () => {},
  onMouseMove: () => {},
  forceOpen: () => {},
  forceClose: () => {},
  parentKeyNavigationHandler: () => {},
  selected: () => false,
  ref: () => {},
});
