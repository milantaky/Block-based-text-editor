import { useDroppable } from "@dnd-kit/core";
import { Children, ReactNode } from "react";

export default function Line({
    children,
    lineIndex,
    baseLineHeight
  }: {
    children: ReactNode;
    lineIndex: number;
    baseLineHeight: number;
  }) {
    const { setNodeRef, isOver } = useDroppable({
      id: `line-${lineIndex}`, // důležité: musíš použít ID řádku
      data: {
        type: "line",
        lineIndex,
      },
    });

    // ! pak jak se oddelaji ramecky, upravit!!!
    const minHeight = baseLineHeight - 16; // Base line height - 16px top, bottom padding

    const childrenArray = Children.toArray(children);
    const isEmpty = childrenArray.length === 0;
    const style = isEmpty ? { minHeight: `${minHeight}px` } : undefined;

    return (
      <div
        ref={setNodeRef}
        className={`line ${isOver ? "drag-over" : ""}`}
        data-index={lineIndex}
        style={style}
      >
        {children}
      </div>
    );
  }
