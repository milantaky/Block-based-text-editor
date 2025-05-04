import { useState } from "react";
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
  const [customBlocks, setCustomBlocks] = useState({
    type: -2,
    items: new Set<string>(["sjdjdj"]),
  });
  console.log(customBlocks)

  const filteredCategories = Object.entries(language).filter(
    ([, data]) => data.prefab
  );

  // TODO
  function onCreate(newBlock: string) {
    setCustomBlocks((prev) => {
      const updatedItems = new Set(prev.items);
      updatedItems.add(newBlock);
      return {
        type: -1,
        items: updatedItems,
      };
    });
  }

  return (
    <div className="prefab-container">
      <h3>Prefab Section</h3>

      <CreatePrefab onCreate={onCreate}/>

      {filteredCategories.map(([category, data]) => (
        <PrefabBlockCategory
          key={category}
          category={category}
          data={data}
          onClick={onClick}
        />
      ))}

      <PrefabBlockCategory
        key="custom"
        category="custom"
        data={customBlocks}
        onClick={onClick}
      />
    </div>
  );
}
