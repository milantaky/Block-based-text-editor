import CreatePrefab from "./CreatePrefab";
import PrefabBlockButton from "./PrefabBlockButton";

export default function PrefabBlockCategory({
  category,
  data,
  onClick,
  onCreate,
}: {
  category: string;
  data: any;
  onClick: (content: string, wordType: number) => void;
  onCreate: (newBlock: string) => void;
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
          />
        ))}

        {category === "custom" && <CreatePrefab onCreate={onCreate} />}
      </div>
    </div>
  );
}
