import CreatePrefab from "./CreatePrefab";
import PrefabBlockButton from "./PrefabBlockButton";

export default function PrefabBlockCategory({
  category,
  data,
  onClick,
  onCreate,
  onDelete
}: {
  category: string;
  data: {
    type: number;
    items: Set<string>;
  };
  onClick: (content: string, wordType: number) => void;
  onCreate: (newBlock: string) => void;
  onDelete: (newBlock: string) => void;
}) {
  return (
    <div key={category} className="prefab-category">
      <span>{category}</span>

      <div className="prefab-category-items">
        {[...data.items].map((item) => (
          <PrefabBlockButton
            key={item}
            content={item}
            wordType={data.type}
            onClick={onClick}
            onDelete={onDelete}
          />
        ))}

        {category === "custom" && <CreatePrefab onCreate={onCreate}/>}
      </div>
    </div>
  );
}
