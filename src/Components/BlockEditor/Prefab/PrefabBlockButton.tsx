export default function PrefabBlockButton({
    content,
    wordType,
    onClick
  }: {
    content: string;
    wordType: number;
    onClick: (content: string, wordType: number) => void;
  }) {
    return (
      <button
        className="prefab-block-button"
        onClick={() => onClick(content, wordType)}
      >
        {content}
      </button>
    );
  }