import { useDroppable } from "@dnd-kit/core";
import { Children, ReactNode } from "react";

export default function Line({
  children,
  lineIndex,
  baseLineHeight,
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
  const minHeight = baseLineHeight - 8; // Base line height - 16px top, bottom padding

  const childrenArray = Children.toArray(children);
  const isEmpty = childrenArray.length === 0;
  const style = isEmpty ? { minHeight: `${minHeight}px` } : undefined;

  return (
      <div className="line">
        <div className="line-number">{lineIndex + 1}</div>
        <div
          ref={setNodeRef}
          className={`line-content ${isOver ? "drag-over" : ""}`}
          data-index={lineIndex}
          style={style}
        >
          {children}
        </div>
      </div>
  );
}
