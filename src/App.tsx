import { useState, useRef } from "react";
import TextEditor from "./Components/TextEditor/TextEditor.tsx";
import BlockEditor from "./Components/BlockEditor/BlockEditor.tsx";
import { earsTest } from "./wordCategories.tsx";
import type { BlockStylesMap, BlockType, editorMode } from "./types";
import "./App.css";
import Tippy from "@tippyjs/react";
import { SwatchesPicker, ColorResult } from "react-color";

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
  const [fontFamily, setFontFamily] = useState("serif");
  const [fontSize, setFontSize] = useState(16);
  const [selectedBlockType, setSelectedBlockType] = useState<string | null>(
    blockTypes[0]
  );
  const [blockStyles, setBlockStyles] = useState<BlockStylesMap>(
    generateBlockStyles(language)
  );

  // Generates initial block styles
  function generateBlockStyles(data: typeof language) {
    const result: Record<
      string,
      { backgroundColor: string; color: string; borderColor: string }
    > = {};

    for (const key in data) {
      const typedKey = key as keyof typeof data;
      const category = data[typedKey];

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
            {editorMode === "Blocks" && (
              <div className="settings-item">
                <label>Show prefabricated blocks: </label>
                <input
                  className="setting-checkbox"
                  type="checkbox"
                  checked={prefabVisible}
                  onChange={togglePrefab}
                />
              </div>
            )}

            {/* Font */}
            <div className="settings-item">
              <label>Font:</label>
              <select
                className="settings-select"
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
              >
                <option value="sans-serif">Sans-serif</option>
                <option value="serif">Serif</option>
                <option value="monospace">Monospace</option>
              </select>
            </div>

            {/* Font Size */}
            <div className="settings-item">
              <label>Font size:</label>
              <input
                className="settings-number"
                type="number"
                value={fontSize || 16}
                onChange={(e) => setFontSize(parseInt(e.target.value))}
              />
            </div>

            {/* Background color */}
            <div className="settings-item">
              <label>Background Color:</label>
              <Tippy
                interactive={true}
                trigger="click"
                content={
                  <SwatchesPicker
                    color={backgroundColor}
                    onChangeComplete={(color: ColorResult) =>
                      setBackgroundColor(color.hex)
                    }
                  />
                }
              >
                <div
                  className="color-div"
                  style={{ backgroundColor: backgroundColor }}
                ></div>
              </Tippy>
            </div>

            {/* Blocks customization */}
            {editorMode === "Blocks" && (
              <div className="settings-blocks">
                <h4>Blocks Customization:</h4>

                <div className="blocks-selection">
                  {blockTypes.map((type) => (
                    <button
                      key={type}
                      className={`${
                        selectedBlockType === type ? "selected" : ""
                      } customize-button`}
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
                      <Tippy
                        interactive={true}
                        trigger="click"
                        content={
                          <SwatchesPicker
                            color={
                              blockStyles[selectedBlockType].backgroundColor
                            }
                            onChangeComplete={(colour: ColorResult) =>
                              setBlockStyles((prev) => ({
                                ...prev,
                                [selectedBlockType]: {
                                  ...prev[selectedBlockType],
                                  backgroundColor: colour.hex,
                                  color: prev[selectedBlockType].color,
                                  borderColor:
                                    prev[selectedBlockType].borderColor,
                                },
                              }))
                            }
                          />
                        }
                      >
                        <div
                          className="color-div"
                          style={{
                            backgroundColor:
                              blockStyles[selectedBlockType].backgroundColor,
                          }}
                        ></div>
                      </Tippy>
                    </div>

                    {/* Block Text Color */}
                    <div className="block-selection-item">
                      <label>Text Color:</label>
                      <Tippy
                        interactive={true}
                        trigger="click"
                        content={
                          <SwatchesPicker
                            color={blockStyles[selectedBlockType].color}
                            onChangeComplete={(colour: ColorResult) =>
                              setBlockStyles((prev) => ({
                                ...prev,
                                [selectedBlockType]: {
                                  ...prev[selectedBlockType],
                                  color: colour.hex,
                                  backgroundColor:
                                    prev[selectedBlockType]?.backgroundColor,
                                  borderColor:
                                    prev[selectedBlockType].borderColor,
                                },
                              }))
                            }
                          />
                        }
                      >
                        <div
                          className="color-div"
                          style={{
                            backgroundColor:
                              blockStyles[selectedBlockType].color,
                          }}
                        ></div>
                      </Tippy>
                    </div>

                    {/* Block Border Color */}
                    <div className="block-selection-item">
                      <label>Border Color:</label>
                      <Tippy
                        interactive={true}
                        trigger="click"
                        content={
                          <SwatchesPicker
                            color={blockStyles[selectedBlockType].borderColor}
                            onChangeComplete={(colour: ColorResult) =>
                              setBlockStyles((prev) => ({
                                ...prev,
                                [selectedBlockType]: {
                                  ...prev[selectedBlockType],
                                  borderColor: colour.hex,
                                  backgroundColor:
                                    prev[selectedBlockType].backgroundColor,
                                  color: prev[selectedBlockType].color,
                                },
                              }))
                            }
                          />
                        }
                      >
                        <div
                          className="color-div"
                          style={{
                            backgroundColor:
                              blockStyles[selectedBlockType].borderColor,
                          }}
                        ></div>
                      </Tippy>
                    </div>
                  </div>
                )}
              </div>
            )}
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
              blockStyles,
              fontSize,
            }}
          />
        ) : (
          <TextEditor
            blocks={blocksRef.current}
            textRef={textRef}
            customization={{ fontFamily, backgroundColor, fontSize }}
          />
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
