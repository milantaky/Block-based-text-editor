import { BlockType } from "./types";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function SortableBlock({
  block,
  lineIndex,
}: {
  block: BlockType;
  lineIndex: number;
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
      className="block"
      data-lineindex={lineIndex}
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


// export default function Block({
//   block,
//   lineIndex,
// }: blockProps & { lineIndex: number }) {
//   return (
//     <div
//       className="block"
//       data-index={block.index}
//       data-lineindex={lineIndex}
//       // contentEditable
//       // suppressContentEditableWarning
//       // onDoubleClick={() => console.log("akjscnkasncj")}
//     >
//       {block.content}
//     </div>
//   );
// }
