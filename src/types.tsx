export type BlockType = {
  index: number;
  content: string;
  wordType: number;
};

export type blockProps = {
  block: BlockType;
};

export type editorMode = "Blocks" | "Text";

export type BlockStyle = {
  backgroundColor: string;
  color: string;
  borderColor: string;
};

export type BlockStylesMap = {
  [blockType: string]: BlockStyle;
};
