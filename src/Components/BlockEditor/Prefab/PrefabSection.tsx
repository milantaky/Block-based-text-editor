import { useState } from "react";
import { earsTest } from "../../../wordCategories.tsx";
import { BlockStylesMap } from "../../../types.tsx";
import PrefabBlockCategory from "./PrefabCategory.tsx";
import "./PrefabSection.css";

const language = earsTest;

// Section with prefabricates
export default function PrefabSection({
  onClick,
  customization
}: {
  onClick: (content: string, wordType: number) => void;
  customization: {
    backgroundColor: string;
    blockStyles: BlockStylesMap;
  };
}) {
  const [customBlocks, setCustomBlocks] = useState({
    type: -2,
    items: new Set<string>([]),
  });

  const filteredCategories = Object.entries(language).filter(
    ([, data]) => data.prefab
  );

  function onCreate(newBlock: string) {
    setCustomBlocks((prev) => {
      const updatedItems = new Set(prev.items);
      updatedItems.add(newBlock);
  
      return {
        type: -2,
        items: updatedItems,
      };
    });
  }

  function onDelete(newBlock: string) {
    setCustomBlocks((prev) => {
      const updatedItems = new Set(prev.items);
      updatedItems.delete(newBlock);
  
      return {
        type: -2,
        items: updatedItems,
      };
    });
  }

  return (
    <div className="prefab-container">
      <div className="prefab-header">
        <h3>Prefabricated Blocks</h3>
      </div>

      <div className="prefab-category-list"
      style={{backgroundColor: customization.backgroundColor}}>
        {filteredCategories.map(([category, data]) => (
          <PrefabBlockCategory
            key={category}
            category={category}
            data={data}
            customization={customization}
            onClick={onClick}
            onCreate={onCreate}
            onDelete={onDelete}
          />
        ))}

        <PrefabBlockCategory
          key="custom"
          category="custom"
          data={customBlocks}
          customization={customization}
          onClick={onClick}
          onCreate={onCreate}
          onDelete={onDelete}
        />

      </div>
    </div>
  );
}
