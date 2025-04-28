import { BlockType } from "./types";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function SortableBlock({
  block,
  lineIndex,
  indexOnLine
}: {
  block: BlockType;
  lineIndex: number;
  indexOnLine: number;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: block.index });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      className={`block type-${block.wordType}`}
      data-lineindex={lineIndex}
      data-indexonline={indexOnLine}
      data-index={block.index}
      style={style}
      {...attributes}
      {...listeners}
      // contentEditable
      // suppressContentEditableWarning
      // onDoubleClick={() => console.log("akjscnkasncj")}
    >
      {block.content}
    </div>
  );
}