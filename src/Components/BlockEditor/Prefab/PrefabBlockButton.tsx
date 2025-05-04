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
      <div
        className="prefab-block-button"
        onClick={() => onClick(content, wordType)}
      >
        {content}
      </div>
    );
  }