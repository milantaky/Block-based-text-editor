import { BlockStyle, BlockType } from "../../../types";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function SortableBlock({
  block,
  lineIndex,
  indexOnLine,
  isSelected,
  onBlockDoubleClick,
  customization,
}: {
  block: BlockType;
  lineIndex: number;
  indexOnLine: number;
  isSelected: boolean;
  onBlockDoubleClick: (blockIndex: number, content: string, blockLine: number, blockIndexOnLine: number) => void;
  customization: BlockStyle
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: block.index });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    color: customization.color,
    backgroundColor: customization.backgroundColor,
    borderColor: customization.borderColor
    // boxShadow: showShadows
    // ? "rgba(0, 0, 0, 0.15) 1px 1px 2px;"
    // : "none",
  };

  return (
    <div
      ref={setNodeRef}
      className={`block type-${block.wordType} ${isSelected && "selected"}`}
      data-lineindex={lineIndex}
      data-indexonline={indexOnLine}
      data-index={block.index}
      style={style}
      {...attributes}
      {...listeners}
      onDoubleClick={() => onBlockDoubleClick(block.index, block.content, lineIndex, indexOnLine)}
    >
      {block.content}
    </div>
  );
}