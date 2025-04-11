import { useState, useRef, useEffect } from "react";
import "./App.css";
import TextEditor from "./TextEditor.tsx";
import BlockEditor from "./BlockEditor.tsx";

type mode = "Blocks" | "Text";

function App() {
  const [editorMode, setEditorMode] = useState<mode>("Blocks"); // Text / Block mode
  const blocksRef = useRef<string[]>([]);
  const textRef = useRef<string>("");

  function toggleEditorMode() {
    if (editorMode === "Text") {
      // console.log("TEXT TED:", textRef.current)
      setEditorMode("Blocks");
    } else {
      // console.log("BLOCKS TED:", blocksRef.current)
      setEditorMode("Text");
    }
  }

  function SwitchButton() {
    return (
      <button className="mode-switch-button" onClick={toggleEditorMode}>
        Switch to {editorMode === "Text" ? "Blocks" : "Text"}
      </button>
    );
  }

  // Block Mode
  return (
    <div className="editor">
      <div className="editable-area">
        {editorMode === "Blocks" && (
          <BlockEditor text={textRef.current} blocksRef={blocksRef} />
        )}
        {editorMode === "Text" && (
          <TextEditor blocks={blocksRef.current} textRef={textRef} />
        )}
      </div>

      <SwitchButton />
    </div>
  );
}

export default App;
