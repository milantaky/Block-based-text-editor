import { useState, useRef } from "react";
import TextEditor from "./TextEditor.tsx";
import BlockEditor from "./BlockEditor.tsx";
import "./App.css";

type mode = "Blocks" | "Text";

type blockProps = {
  index: number;
  content: string;
  wordType: number;
};

export default function App() {
  const [editorMode, setEditorMode] = useState<mode>("Blocks");
  const blocksRef = useRef<blockProps[]>([]);
  const textRef = useRef<string>("");

  function toggleEditorMode() {
    if (editorMode === "Text") {
      setEditorMode("Blocks");
    } else {
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

  return (
    <div className="editor">
      <div className="editable-area">
        {editorMode === "Blocks" ? (
          <BlockEditor text={textRef.current} blocksRef={blocksRef} />
        ) : (
          <TextEditor blocks={blocksRef.current} textRef={textRef} />
        )}
      </div>

      <SwitchButton />
    </div>
  );
}
