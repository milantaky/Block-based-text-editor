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
  const [inputIndex, setInputIndex] = useState(0);            // This index says before which block the input is
  const [inputLineIndex, setInputLineIndex] = useState(0);    // Which line the input is on (0 = first line)
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

  // Gets index to insert to, from counting blocks before index
  function countInsertIndex(){
    let count = 0 

    for (let i = 0; i < inputLineIndex; i++) {
      count += lines[i].length + 1;
    }
  
    count += inputIndex;
  
    return count;
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    // TODO: make it a switch

    // Space bar
    if (e.key === " " && inputText.trim() !== "") {
      e.preventDefault();

      // First Block
      if (blocks.length === 0) {    
        setBlocks([inputText.trim()]);
        console.log("tuu2")
      } else {

        // Input on end
        if(inputIndex === lines[inputLineIndex].length && inputLineIndex === lines.length - 1){
            setBlocks([...blocks, inputText.trim()]);
            console.log("tuu")
        } else {
          // Input not on end
          const insertIndex = countInsertIndex(); 

          setBlocks(prevBlocks => [
            ...prevBlocks.slice(0, insertIndex),
            inputText.trim(),
            ...prevBlocks.slice(insertIndex)
          ]);
        }
      }
      
      setInputText("");
      setInputIndex(inputIndex + 1);

    // Backspace
    } else if (e.key === "Backspace" && inputText === "" && blocks.length > 0) {
      e.preventDefault();
      const insertIndex = countInsertIndex(); 
      
      setInputText(blocks[insertIndex - 1]);
      setInputIndex(inputIndex - 1);

      setBlocks(prevBlocks => 
        inputIndex === prevBlocks.length && inputLineIndex === lines.length
          ? prevBlocks.slice(0, -1)                                     // Input on end
          : prevBlocks.filter((_, index) => index !== insertIndex - 1)  // Input elsewhere
      );

      changeBlockRef.current = true;

    // Left Arrow Key
    } else if (e.key === "ArrowLeft" && inputText === "" && inputIndex > 0) {
      e.preventDefault();
      setInputIndex(inputIndex - 1);

    // Right Arrow Key
    } else if (e.key === "ArrowRight" && inputText === "" && inputIndex < lines[inputLineIndex].length) {
      e.preventDefault();
      setInputIndex(inputIndex + 1);

    } else if(e.key === "ArrowUp" && inputText === "" && inputLineIndex > 0){
      e.preventDefault();
      setInputLineIndex(inputLineIndex - 1);
      
      // If lower line is longer, set input index to end of upper line
      if(inputIndex > lines[inputLineIndex - 1].length){
        setInputIndex(lines[inputLineIndex - 1].length);
      } 
      
    } else if(e.key === "ArrowDown" && inputText === "" && inputLineIndex < lines.length - 1){
      e.preventDefault();
      setInputLineIndex(inputLineIndex + 1);

      // If there is line below
      // If upper line is longer, set input index to end of lower line
      if(inputIndex > lines[inputLineIndex + 1].length){
        setInputIndex(lines[inputLineIndex + 1].length);
      } 

    } else if(e.key === "Enter"){
      if(inputText !== ""){
        setBlocks([...blocks, inputText.trim(), '\n']);
        setInputText("");
      } else {
        setBlocks([...blocks, '\n']);
      }
      
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
        {
          lines.map((line, lineIndex) => {

            // No Blocks
            if(lines.length === 1 && line.length === 0){
              return (
                <div key={lineIndex} className="line">  
                  <InputBox/>
                </div>
              );
            } 
            else {
              // Empty line
              if (line.length === 0 && inputIndex === 0 && inputLineIndex === lineIndex) {
                return (
                  <div key={lineIndex} className="line">  
                    <InputBox/>
                  </div>
                );
              }

              // Lines and blocks
              return (
                <div key={lineIndex} className="line">
                  {line.map((word, wordIndex) => {

                    // ========== Line without input
                    if(lineIndex !== inputLineIndex){
                      // console.log("TUUUU")
                      return <Block index={wordIndex} content={word}/>;
                    } 
                    
                    // ========== Line with input
                    // Input on start of line
                    if (inputIndex === 0 && wordIndex === 0){
                      // console.log("ZDE")
                      return (
                        <>
                           <InputBox/>
                           <Block index={wordIndex} content={word}/>
                        </>
                      );

                    } 
                    // Input after this block
                    else if (inputIndex - 1 === wordIndex){
                      // console.log("ZDE@")
                      return (
                        <>
                          <Block index={wordIndex} content={word}/>
                          <InputBox/>
                        </>
                      );

                    } 
                    // Input elsewhere
                    else {
                      // console.log("TUUUU2")
                      return <Block index={wordIndex} content={word}/>;
                    }

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
