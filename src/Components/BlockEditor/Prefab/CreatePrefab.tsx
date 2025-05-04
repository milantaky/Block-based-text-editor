import { useState } from "react";

export default function CreatePrefab({
  onCreate,
}: {
  onCreate: (newBlock: string) => void;
}) {
  const [createNew, setCreateNew] = useState(false);
  const [newBlockName, setNewBlockName] = useState("");

  function handleClick() {
    if (createNew) setNewBlockName("");
    setCreateNew(!createNew);
  }

  function handleCreate() {
    const blockName = newBlockName.trim();
    if (blockName) {
      onCreate(blockName);
      setNewBlockName("");
      setCreateNew(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setNewBlockName(e.target.value);
  }

  return (
    <div className="create-prefab">
      {!createNew ? (
        <button onClick={handleClick}>Create New</button>
      ) : (
        <>
          <input
            type="text"
            placeholder="Create New Block"
            value={newBlockName}
            onChange={(e) => handleChange(e)}
          ></input>
          <button onClick={handleCreate}>Create</button>
          <button onClick={handleClick}>Cancel</button>
        </>
      )}
    </div>
  );
}
