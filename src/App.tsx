import { useState, useRef } from "react";
import "./App.css";

function App() {
  // const [text, setText] = useState("");
  const [blocks, setBlocks] = useState([]);
  const editorRef = useRef(null);

  // Updates text in editor using ref
  function handleTextChange(e){
    if (editorRef.current) {
      // setText(editorRef.current.innerHTML);
      // setBlocks(editorRef.current.innerText.split(' '));
    }
  }

  function handleKeyDown(e){
    if(e.key === " "){
      const lastCaretPosition = window.getSelection()?.focusOffset;

      if (editorRef.current) {
        let last = editorRef.current.innerText.split(' ')
        
        editorRef.current.innerHTML += `<span class='block'>${last}</span>`;

        console.log(editorRef.current.innerText)


        // Set caret (text cursor) position
        let textNode = document.querySelector('.editable-area')?.firstChild;
        let range = document.createRange();
        range.setStart(textNode, lastCaretPosition);
        range.setEnd(textNode, lastCaretPosition);
        let sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      }
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
          onInput={handleTextChange}
          onKeyDown={handleKeyDown}
          >
            {/* This is where the text is */}
        </div>
        <div>
          {/* {
            blocks.map(block => {
              return <span className="block">{block}</span>
            })
          } */}
        </div>
      </div>
    </>
  );
}

export default App;

