import { createContext } from "react";

type Child = string;
export const Context = createContext<{
  addChildItem: () => string;

  // onMouseMove is only needed for non selected items
  onMouseMove: (childId: string) => any;
  onMouseLeave: () => void;

  // special props for SubMenu only
  forceOpen: (child: string) => any;
  forceClose: () => any;
  parentKeyNavigationHandler: (event: KeyboardEvent) => any;

  // special props for selected item only
  selected: (child: string) => boolean;
  ref: (ref: React.ReactElement | null) => void;
}>({
  addChildItem: () => throwError(),
  onMouseLeave: () => throwError(),
  onMouseMove: () => throwError(),
  forceOpen: () => throwError(),
  forceClose: () => throwError(),
  parentKeyNavigationHandler: () => throwError(),
  selected: () => throwError(),
  ref: () => throwError(),
});

const throwError = () => {
  throw new Error("The Item is not in menu. Please put item in menu.");
};

