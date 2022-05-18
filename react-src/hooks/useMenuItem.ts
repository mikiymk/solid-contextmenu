import { useState } from "react";

export const useMenuItem = () => {
  const [selectedItemId, setSelectedItemId] = useState<string>();
  const [forceSubMenuOpen, setForceSubMenuOpen] = useState(false);

  /**
   * callback function when the mouse pointer moves within a child item element
   * required only for unselected items
   * @param childId identify the child item element
   */
  const onChildMouseMove = (childId: string) => {
    if (selectedItemId !== childId) {
      setSelectedItemId(childId);
      setForceSubMenuOpen(false);
    }
  };

  /**
   * callback function when the mouse pointer leaves the child item element
   */
  const onChildMouseLeave = () => {
    setSelectedItemId(undefined);
    setForceSubMenuOpen(false);
  };

  return {
    selectedItemId,
    setSelectedItemId,
    forceSubMenuOpen,
    setForceSubMenuOpen,
    onChildMouseLeave,
    onChildMouseMove,
  };
};
