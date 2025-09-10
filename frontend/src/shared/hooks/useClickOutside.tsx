import React from "react";

interface UseClickOutsideProps {
  popupRef: React.RefObject<HTMLElement | null>,
  closeFunction: () => void,
  buttonRef?: React.RefObject<HTMLElement | SVGSVGElement | null>,
}

export const useClickOutside = ({
  popupRef,
  closeFunction,
  buttonRef,
}: UseClickOutsideProps) => {
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node) &&
        buttonRef?.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        closeFunction();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [popupRef, buttonRef, closeFunction]);
};
