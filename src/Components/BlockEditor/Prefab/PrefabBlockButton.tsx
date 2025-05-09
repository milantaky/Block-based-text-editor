import { earsTest } from "../../../wordCategories";
import { BlockStylesMap } from "../../../types";

const language = earsTest;
const typeToKeyMap = createTypeToKeyMap(language);

function createTypeToKeyMap(language: typeof earsTest): Record<number, string> {
  const map: Record<number, string> = {};
  for (const key of Object.keys(language)) {
    const typedKey = key as keyof typeof language;
    const item = language[typedKey];
    map[item.type] = key;
  }

  return map;
}

// Removes . , ' " from string
function sanitizeBlock(word: string) {
  return word.replace(/[.,'"]/g, "");
}

// Gets word type
function getWordType(word: string) {
  if (!isNaN(Number(word))) return 0;

  for (const [, data] of Object.entries(language)) {
    if (data.items.has(sanitizeBlock(word))) return data.type;
  }

  return -1;
}

export default function PrefabBlockButton({
  content,
  wordType,
  customization,
  onClick,
  onDelete,
}: {
  content: string;
  wordType: number;
  customization: {
    blockStyles: BlockStylesMap;
  };
  onClick: (content: string, wordType: number) => void;
  onDelete: (content: string) => void;
}) {
  // Is custom?
  const blockType = wordType === -2 ? getWordType(content) : wordType;

  // Is in category?
  const styles =
    blockType === -1
      ? null
      : customization.blockStyles[typeToKeyMap[blockType]];

  // Is in category?
  const style =
    blockType !== -1
      ? {
          color: styles!.color,
          backgroundColor: styles!.backgroundColor,
          borderColor: styles!.borderColor,
        }
      : undefined;

  return (
    <div className="custom-block">
      <div
        className={`prefab-block-button type-${blockType}`}
        onClick={() => onClick(content, wordType)}
        style={style}
      >
        {content}
      </div>
      {wordType === -2 && (
        <div className="delete-custom-button" onClick={() => onDelete(content)}>
          X
        </div>
      )}
    </div>
  );
}
