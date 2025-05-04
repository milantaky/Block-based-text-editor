import { earsTest } from "./wordCategories.tsx";

const language = earsTest;

function CreatePrefab(){
    return (
        <div className="create-prefab">
            <button>Create New</button>
        </div>
    );
  }

  // Section with prefabricated blocks
  function PrefabBlockButton({
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


  // Section with prefabricated categories
  function PrefabBlockCategory({
    category,
    data,
    onClick
  }: {
    category: string;
    data: any;
    onClick: (content: string, wordType: number) => void;
  }) {
    return (
      <div key={category} className="prefab-category">
        <h4>{category}</h4>

        {[...data.items].map((item) => (
          <PrefabBlockButton key={item} content={item} wordType={data.type} onClick={onClick}/>
        ))}
      </div>
    );
  }

  // Section with prefabricates
  export default function PrefabSection({onClick}: { onClick: (content: string, wordType: number) => void }) {
    const filteredCategories = Object.entries(language).filter(
      ([, data]) => data.prefab
    );

    return (
      <div className="prefab-container">
        <h3>Prefab Section</h3>

        {filteredCategories.map(([category, data]) => (
          <PrefabBlockCategory key={category} category={category} data={data} onClick={onClick}/>
        ))}

        <CreatePrefab />
      </div>
    );
  }