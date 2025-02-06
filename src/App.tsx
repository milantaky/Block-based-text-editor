import { useState, useRef, useEffect } from "react";
import "./App.css";

function App() {
  const [blocks, setBlocks] = useState<string[]>([]);
  const [inputText, setInputText] = useState("");
  const [inputIndex, setInputIndex] = useState(0);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    editorRef.current?.focus();
    // editorRef.current!.textContent = inputText;      // Not working well
  }, [inputIndex, inputText]);
  
  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    // TODO: make it a switch

    // Space bar
    if (e.key === " " && inputText.trim() !== "") {
      e.preventDefault();

      // First Block
      if (blocks.length === 0) {    
        setBlocks([inputText.trim()]);
      } else {

        // Input not on end
        if(inputIndex !== blocks.length){
          setBlocks(prevBlocks => [
            ...prevBlocks.slice(0, inputIndex),
            inputText.trim(),
            ...prevBlocks.slice(inputIndex)
          ]);
        // Input on end
        } else {
          setBlocks([...blocks, inputText.trim()]);
        }
      }
      
      setInputText("");
      setInputIndex(inputIndex + 1);

    // Backspace
    } else if (e.key === "Backspace" && inputText === "" && blocks.length > 0) {
      e.preventDefault();

      setInputText(blocks[blocks.length - 1]);
      setBlocks(blocks.slice(0, -1));
      setInputIndex(inputIndex - 1);

    // Left Arrow Key
    } else if (e.key === "ArrowLeft" && inputText === "" && inputIndex > 0) {
      e.preventDefault();

      setInputIndex(inputIndex - 1);

    // Right Arrow Key
    } else if (e.key === "ArrowRight" && inputText === "" && inputIndex < blocks.length) {
      e.preventDefault();

      setInputIndex(inputIndex + 1);
    }
  }

  function handleInput(e: React.FormEvent<HTMLDivElement>) {
    setInputText(e.currentTarget.textContent || "");
  }

  return (
    <div className="editor">
      <div className="editable-area">
        {blocks.map((block, index) => (
          (index === inputIndex) 
          ?
          <>
            <div
              ref={editorRef}
              className="input-box"
              contentEditable
              suppressContentEditableWarning
              onInput={handleInput}
              onKeyDown={handleKeyDown}
              />
            <span 
              key={index} 
              className="block" 
              contentEditable
              suppressContentEditableWarning
              >
              {block}
            </span>
          </>
          :
            <span 
              key={index} 
              className="block" 
              contentEditable
              suppressContentEditableWarning
            >
              {block}
            </span>
        ))}
        {(blocks.length === 0 || blocks.length === inputIndex) &&
        <div
          ref={editorRef}
          className="input-box"
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onKeyDown={handleKeyDown}
        />
        }
      </div>
    </div>
  );
}

export default App;
