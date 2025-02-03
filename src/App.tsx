import { useState, useRef } from "react";
import "./App.css";

function App() {
  // const [text, setText] = useState("");
  const [textMode, setTextMode] = useState(true);
  const [blocks, setBlocks] = useState([]);
  const editorRef = useRef(null);

  // Updates text in editor using ref
  // function handleTextChange(e){
  //   if (editorRef.current) {
  //     // setText(editorRef.current.innerHTML);
  //     // setBlocks(editorRef.current.innerText.split(' '));
  //   }
  // }

  function Block({ content }){
    return <span className="block">{content}</span>;
  }

  function setCaretPosition(position: number) {
    const textNode = document.querySelector('.editable-area');
    const range = document.createRange();
    range.setStart(textNode, position);
    range.setEnd(textNode, position);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }

  function convertToBlock(){

    const lastCaretPosition = window.getSelection()?.focusOffset;

    if(editorRef.current){
      let last = editorRef.current.innerText.split(' ').pop();
      
      editorRef.current.innerHTML += `<span class='block'>${last}</span>`;
      
      console.log(editorRef.current.innerText)

      setCaretPosition(lastCaretPosition);
    }
  }

  function handleKeyDown(e){
    if(e.key === " "){
      if(!textMode){
        convertToBlock();
      }
    }
  }

  function handleButtonClick(){
    setTextMode(!textMode);
  }

  return (
    <>
      <div className="editor">
        <div 
          className="editable-area"
          ref={editorRef}
          contentEditable="true" 
          suppressContentEditableWarning={true}
          // onInput={handleTextChange}
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
        <div>
          <button onClick={handleButtonClick}>Switch Modes</button>
          {(textMode) ? "text" : "blocks"}
        </div>
      </div>
    </>
  );
}

export default App;
