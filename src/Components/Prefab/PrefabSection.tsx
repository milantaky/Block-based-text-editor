import { earsTest } from "../../wordCategories.tsx";
import CreatePrefab from "./CreatePrefab.tsx";
import PrefabBlockCategory from "./PrefabCategory.tsx";
import "./PrefabSection.css";

const language = earsTest;

// Section with prefabricates
export default function PrefabSection({
  onClick,
}: {
  onClick: (content: string, wordType: number) => void;
}) {
  const filteredCategories = Object.entries(language).filter(
    ([, data]) => data.prefab
  );

  return (
    <div className="prefab-container">
      <h3>Prefab Section</h3>

      <CreatePrefab />

      {filteredCategories.map(([category, data]) => (
        <PrefabBlockCategory
          key={category}
          category={category}
          data={data}
          onClick={onClick}
        />
      ))}

    </div>
  );
}
