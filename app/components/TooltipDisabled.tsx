import type { ReactNode } from 'react';
import { useRef, useState } from 'react';

type PropTypes = {
  children: ReactNode;
  content: ReactNode;
  contentClassName?: string;
  sizeHelper?: number;
};

export default function TooltipDisabled({
  children,
  content,
  contentClassName,
}: PropTypes) {
  const childrenRef = useRef<HTMLDivElement>();

  const [position, setTooltipPosition] = useState<
    'bottom' | 'top' | 'left' | 'right' | undefined
  >(undefined);

  const handleMouseEnter = () => {
    const childrenElement = childrenRef.current;

    if (childrenElement) {
      const { left, top, right } = childrenElement.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const windowWidth = window.innerWidth;
      const bottomDistance = windowHeight - top;

      let newPosition;

      // Determine vertical position
      if (bottomDistance < 150) {
        newPosition = 'top';
      } else {
        newPosition = 'bottom';
      }

      // Check if the right value is close to the right side of the page
      const rightCloseToPageRight = windowWidth - right < 150;

      // Check if the left value is close to the left side of the page
      const leftCloseToPageLeft = left < 150;

      if (rightCloseToPageRight) {
        newPosition = 'left';
      } else if (leftCloseToPageLeft) {
        newPosition = 'right';
      }

      setTooltipPosition(newPosition);
    }
  };

  const handleMouseLeave = () => {
    setTooltipPosition(undefined);
  };

  return (
    <div className="relative inline-block">
      {/* hovered element - children */}
      <div
        ref={childrenRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </div>
      {/* content wrapper */}
      <div
        className={`absolute ${
          position === 'top' ? 'bottom-full' : 'top-full'
        } left-1/2 transform -translate-x-1/2 z-50 my-4 ${
          !position && 'hidden'
        }`}
      >
        {/* content */}
        <div
          className={`${contentClassName} bg-orange px-6 py-4 font-normal text-white rounded-lg drop-shadow-md`}
        >
          {content}
        </div>
        {/* arrow */}
        <div
          className={`absolute left-1/2 transform -translate-x-1/2 h-4 w-4 rotate-45 bg-orange ${
            position === 'top'
              ? 'top-full -translate-y-2.5'
              : 'bottom-full translate-y-2.5'
          }`}
          style={{
            left: '50%', // Always center the arrow horizontally
          }}
        />
      </div>
    </div>
  );
}
