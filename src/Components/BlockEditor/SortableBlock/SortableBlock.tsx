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
  onBlockDoubleClick: (
    blockIndex: number,
    content: string,
    blockLine: number,
    blockIndexOnLine: number
  ) => void;
  customization: BlockStyle;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: block.index });

    //TODO uprav tu -1 styly
  const style =
    block.wordType === -1
      ? {
          transform: CSS.Transform.toString(transform),
          transition,
        }
      : {
          transform: CSS.Transform.toString(transform),
          transition,
          color: customization.color,
          backgroundColor: customization.backgroundColor,
          borderColor: customization.borderColor,
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
      onDoubleClick={() =>
        onBlockDoubleClick(block.index, block.content, lineIndex, indexOnLine)
      }
    >
      {block.content}
    </div>
  );
}
