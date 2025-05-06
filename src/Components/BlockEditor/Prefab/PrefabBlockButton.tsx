export default function PrefabBlockButton({
  content,
  wordType,
  onClick,
  onDelete,
}: {
  content: string;
  wordType: number;
  onClick: (content: string, wordType: number) => void;
  onDelete: (content: string) => void;
}) {
  return (
    <div className="custom-block">
      <div
        className="prefab-block-button"
        onClick={() => onClick(content, wordType)}
      >
        {content}
      </div>
      {wordType === -2 && <div className="delete-custom-button" onClick={() => onDelete(content)}>X</div>}
    </div>
  );
}
