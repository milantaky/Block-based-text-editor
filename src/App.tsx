import { useState, useRef, useEffect } from "react";
import "./App.css";

type BlockProps = {
  index: number
  content: string
};

//Teddddddddddd

function App() {
  const [blocks, setBlocks] = useState<string[]>([]);
  const [inputText, setInputText] = useState("");
  const [inputIndex, setInputIndex] = useState(0);
  const [inputLineIndex, setInputLineIndex] = useState(0);
  const editorRef = useRef<HTMLDivElement>(null);
  const changeBlockRef = useRef(false);
  const lines = splitLines(blocks);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.focus();
      editorRef.current.textContent = inputText;
      
      // Sets caret on the end when pressing backspace on block (editing)
      if(changeBlockRef){
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(editorRef.current!);
        range.collapse(false);
        sel!.removeAllRanges();
        sel!.addRange(range);
        
        //! tady zmenit changleblockref zpatky????
      }
    }   

  }, [inputIndex, inputLineIndex, inputText]);

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
        // if(inputIndex !== blocks.length){
        if(inputIndex !== lines[lines.length - 1].length && inputLineIndex !== lines.length){
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

      // Input on end
      if(inputIndex === blocks.length && inputLineIndex === lines.length){
        setInputText(blocks[blocks.length - 1]);
        setInputIndex(inputIndex - 1);
        setBlocks(blocks.slice(0, -1));
      
      // Input on start or in middle
      } else {
        setInputText(blocks[inputIndex - 1]);
        setInputIndex(inputIndex - 1);
        setBlocks(blocks.filter((_, index) => index !== inputIndex - 1));
      }

      changeBlockRef.current = true;

    // Left Arrow Key
    } else if (e.key === "ArrowLeft" && inputText === "" && inputIndex > 0) {
      e.preventDefault();
      setInputIndex(inputIndex - 1);

    // Right Arrow Key
    } else if (e.key === "ArrowRight" && inputText === "" && inputIndex < blocks.length) {
      e.preventDefault();
      setInputIndex(inputIndex + 1);

    } else if(e.key === "Enter"){
      setBlocks([...blocks, '\n']);
      setInputLineIndex(inputLineIndex + 1);
      setInputIndex(0);
    }
  }

  function splitLines(blockss: string[]): string[][] {
    const lines: string[][] = [[]]; 
    let index = 0;

    blockss.forEach(block => {
      // If \n add line, else add to previous
      if (block === '\n') {
        index++;
        lines[index] = []; 
      } else {
        lines[index].push(block);
      }
    });
  
    return lines;
  }

  function handleInput(e: React.FormEvent<HTMLDivElement>) {
    setInputText(e.currentTarget.textContent || "");
  }

  /*
    Handles moving input to place of click.

    If clicked between blocks or on the end, input get set to end
    TODO: FIX CLICK BETWEEN BLOCKS
  */
  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    const clickedElement = e.target as HTMLElement;
    
    // All blocks except "input-box"
    const allBlocks = Array.from(document.querySelectorAll(".block"));
  
    const clickedIndex = allBlocks.indexOf(clickedElement);
    console.log(clickedIndex)
  
    // If clicked outside, or between blocks, sets input to end
    if (clickedIndex === -1) {
      setInputIndex(blocks.length);
    } else {
      setInputIndex(clickedIndex + 1);
    }
  
    setTimeout(() => editorRef.current?.focus(), 0);
  }
  
  function InputBox(){
    return <div
              ref={editorRef}
              className="input-box"
              contentEditable
              suppressContentEditableWarning
              onInput={handleInput}
              onKeyDown={handleKeyDown}
              />;
  }

  function Block({index, content}: BlockProps){
    return <span 
              key={index} 
              className="block" 
              // contentEditable
              suppressContentEditableWarning
              >
              {content}
            </span>;
  }
   
  return (
    <div className="editor">
      <div 
        className="editable-area" 
        // onClick={handleClick}
        >
        {/* {blocks.map((block, index) => (
          (index === inputIndex) 
          ?
          <>
            <InputBox/>
            <Block index={index} content={block}/>
          </>
          :
          <Block index={index} content={block}/>  
        ))} */}

        {
          lines.map((line, lineIndex) => {
            // No Blocks
            if(lines.length === 1 && line.length === 0){
              return (
                <div key={lineIndex} className="line">  
                  <InputBox/>
                </div>
              )
            } else {
              // Empty line
              if (line.length === 0) {
                return (
                  <div key={lineIndex} className="line">  
                    <InputBox/>
                  </div>
                )
              }

              // Lines and blocks
              return (
                <div key={lineIndex} className="line">
                  {line.map((word, wordIndex) => {
                    
                    console.log("line index:", lineIndex, "inputLineIndex:", inputLineIndex, "wordIndex:", wordIndex, "inputIndex: ", inputIndex)
                    console.log(lineIndex === inputLineIndex && (wordIndex === inputIndex - 1 || wordIndex === inputIndex + 1))

                    // Line with input
                    return (lineIndex === inputLineIndex && (wordIndex === inputIndex - 1 || wordIndex === inputIndex + 1 || inputIndex === 0))
                    ?
                      (wordIndex === inputIndex + 1 || inputIndex === 0)
                      ?
                        <>
                          <InputBox/>
                          <Block index={wordIndex} content={word}/>
                          {console.log("ZDE")}
                        </>
                      :
                        <>
                          <Block index={wordIndex} content={word}/>
                          <InputBox/>
                          {console.log("ZDE@")}
                        </>

                    :
                      <>
                        <Block index={wordIndex} content={word}/>
                        {console.log("TUUUU")}
                      </>

                  })}
                </div>
             );
            }
          })
        }
        
        
      </div>
    </div>
  );
}

export default App;
