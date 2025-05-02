export type BlockType = {
  index: number;
  content: string;
  wordType: number;
};

export type blockProps = {
  block: BlockType;
};

export type editorMode = "Blocks" | "Text";