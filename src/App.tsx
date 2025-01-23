import { useState, useRef } from "react";
import "./App.css";

function App() {
  const [text, setText] = useState("");
  // const [blocks, setBlocks] = useState([]);
  const editorRef = useRef(null);

  // Updates text in editor using ref
  function handleTextChange(){
    if (editorRef.current) {
      setText(editorRef.current.innerText);
    }
  }

  return (
    <>
      <div className="editor">
        <div 
          className="editable-area"
          ref={editorRef}
          contentEditable="true" 
          suppressContentEditableWarning={true}
          onInput={handleTextChange}>
            {/* This is where the text is */}
        </div>
      </div>
    </>
  );
}

export default App;

