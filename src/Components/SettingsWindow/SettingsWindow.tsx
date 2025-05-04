import { useState } from "react";

export default function SettingsWindow() {
  const [prefabVisible, setPrefabVisible] = useState(true);

  function togglePrefab() {
    setPrefabVisible(!prefabVisible);
  }

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
