import PrefabBlockButton from "./PrefabBlockButton";

export default function PrefabBlockCategory({
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