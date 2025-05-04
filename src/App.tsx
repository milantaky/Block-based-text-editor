import { useState, useRef } from "react";
import TextEditor from "./Components/TextEditor/TextEditor.tsx";
import BlockEditor from "./Components/BlockEditor/BlockEditor.tsx";
import type { BlockStylesMap, BlockType, editorMode } from "./types";
import { earsTest } from "./wordCategories.tsx";
import "./App.css";

const blockTypes = Object.keys(earsTest);
const language = earsTest;

export default function App() {
  const [editorMode, setEditorMode] = useState<editorMode>("Blocks");
  const textRef = useRef<string>("");
  const blocksRef = useRef<BlockType[]>([]);
  const baseLineHeight = useRef<number>(0); // Height of line on first render to compare if other lines have overflown
  const blhSet = useRef<boolean>(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [prefabVisible, setPrefabVisible] = useState(true);

  // Customization
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [fontFamily, setFontFamily] = useState("sans-serif");
  const [boxShadow, setBoxShadow] = useState(false);
  const [selectedBlockType, setSelectedBlockType] = useState<string | null>(
    blockTypes[0]
  );
  const [blockStyles, setBlockStyles] = useState<BlockStylesMap>(
    generateBlockStyles(language)
  );

  // Generates initial block styles
  function generateBlockStyles(language: any) {
    const result: Record<
      string,
      { backgroundColor: string; color: string; borderColor: string }
    > = {};

    for (const key in language) {
      const category = language[key];
      result[key] = {
        backgroundColor: category.color,
        color: "#000000",
        borderColor: "#888888",
      };
    }

    return result;
  }

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
            {/* Prefab */}
            <div className="settings-item">
              <input
                className="setting-checkbox"
                type="checkbox"
                checked={prefabVisible}
                onChange={togglePrefab}
              />
              <label>Show prefabricated blocks</label>
            </div>

            {/* Shadow */}
            <div className="settings-item">
              <input
                type="checkbox"
                className="setting-checkbox"
                checked={boxShadow}
                onChange={(e) => setBoxShadow(e.target.checked)}
              />
              <label>Enable shadows</label>
            </div>

            {/* Font */}
            <div className="settings-item">
              <label>Font:</label>
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
              >
                <option value="sans-serif">Sans-serif</option>
                <option value="serif">Serif</option>
                <option value="monospace">Monospace</option>
              </select>
            </div>

            {/* Background color */}
            <div className="settings-item">
              <label>Editor background color:</label>
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
              />
            </div>

            {/* Blocks customization */}
            <div className="settings-blocks">
              <h4>Blocks Customization:</h4>

              <div className="blocks-selection">
                {blockTypes.map((type) => (
                  <button
                    key={type}
                    className={`${selectedBlockType === type ? "selected" : ""} customize-button`}
                    onClick={() => setSelectedBlockType(type)}
                    style={blockStyles[type]}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {selectedBlockType && (
                <div className="selection-categories">
                  {/* Block Background Color */}
                  <div className="block-selection-item">
                    <label>Background:</label>
                    <input
                      type="color"
                      value={blockStyles[selectedBlockType].backgroundColor}
                      onChange={(e) =>
                        setBlockStyles((prev) => ({
                          ...prev,
                          [selectedBlockType]: {
                            ...prev[selectedBlockType],
                            backgroundColor: e.target.value,
                            color: prev[selectedBlockType].color,
                            borderColor: prev[selectedBlockType].borderColor,
                          },
                        }))
                      }
                    />
                  </div>

                  {/* Block Text Color */}
                  <div className="block-selection-item">
                    <label>Text Color:</label>
                    <input
                      type="color"
                      value={blockStyles[selectedBlockType].color}
                      onChange={(e) =>
                        setBlockStyles((prev) => ({
                          ...prev,
                          [selectedBlockType]: {
                            ...prev[selectedBlockType],
                            color: e.target.value,
                            backgroundColor:
                              prev[selectedBlockType]?.backgroundColor,
                            borderColor: prev[selectedBlockType].borderColor,
                          },
                        }))
                      }
                    />
                  </div>

                  {/* Block Border Color */}
                  <div className="block-selection-item">
                    <label>Border Color:</label>
                    <input
                      type="color"
                      value={blockStyles[selectedBlockType].borderColor}
                      onChange={(e) =>
                        setBlockStyles((prev) => ({
                          ...prev,
                          [selectedBlockType]: {
                            ...prev[selectedBlockType],
                            borderColor: e.target.value,
                            backgroundColor:
                              prev[selectedBlockType].backgroundColor,
                            color: prev[selectedBlockType].color,
                          },
                        }))
                      }
                    />
                  </div>
                </div>
              )}
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
            customization={{
              fontFamily,
              backgroundColor,
              boxShadow,
            }}
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
