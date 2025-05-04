import { useState, useRef } from "react";
import TextEditor from "./Components/TextEditor/TextEditor.tsx";
import BlockEditor from "./Components/BlockEditor/BlockEditor.tsx";
import type { BlockType, editorMode } from "./types";
import "./App.css";

export default function App() {
  const [editorMode, setEditorMode] = useState<editorMode>("Blocks");
  const textRef = useRef<string>("");
  const blocksRef = useRef<BlockType[]>([]);
  const baseLineHeight = useRef<number>(0); // Height of line on first render to compare if other lines have overflown
  const blhSet = useRef<boolean>(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [prefabVisible, setPrefabVisible] = useState(true);

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
        Switch to <b>{editorMode === "Text" ? "Blocks" : "Text"}</b>
      </button>
    );
  }

  function toggleSettings() {
    setSettingsVisible(!settingsVisible);
  }

  function SettingsButton() {
    return (
      <button className="settings-window-button" onClick={toggleSettings}>
        Settings
      </button>
    );
  }

  function togglePrefab() {
    setPrefabVisible(!prefabVisible);
  }

  function SettingsWindow() {
    return (
      <>
        <div className="settings-window">
          <h3 className="settings-header">Settings</h3>
          <div className="settings-items">
            <div className="settings-item">
              <input
                className="setting-checkbox"
                type="checkbox"
                checked={prefabVisible}
                onChange={togglePrefab}
              />
              Show prefabricated blocks
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="editor">
      <div className="editable-area">
        {editorMode === "Blocks" ? (
          <BlockEditor
            text={textRef.current}
            blocksRef={blocksRef}
            baseLineHeight={baseLineHeight}
            blhSet={blhSet}
            prefabVisible={prefabVisible}
          />
        ) : (
          <TextEditor blocks={blocksRef.current} textRef={textRef} />
        )}
      </div>

      {settingsVisible && <SettingsWindow />}

      <div className="main-buttons">
        <SwitchButton />
        <SettingsButton />
      </div>
    </div>
  );
}
