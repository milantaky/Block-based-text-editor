import { blockProps } from "./types";

export default function Block({
  block,
  lineIndex,
}: blockProps & { lineIndex: number }) {
  return (
    <div
      className="block"
      data-index={block.index}
      data-lineindex={lineIndex}
      // contentEditable
      // suppressContentEditableWarning
      // onDoubleClick={() => console.log("akjscnkasncj")}
    >
      {block.content}
    </div>
  );
}
