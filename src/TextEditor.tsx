import { useRef, useState, useEffect } from "react";
import type { BlockType } from "./types";
import "./TextEditor.css";

export default function TextEditor({
  blocks,
  textRef,
}: {
  blocks: BlockType[];
  textRef: React.MutableRefObject<string>;
}) {
  const [text, setText] = useState(convertToText(blocks));
  const editableRef = useRef<HTMLDivElement>(null);
  const highlightedWords = highlightWords(text);

  // On first render -> transform BLOCKS to TEXT, set caret to end
  useEffect(() => {
    if (editableRef.current) {
      editableRef.current.innerText = text;
      editableRef.current.focus();
    }

    setCaretToEnd();
  }, []);

  // Sets current text to ref for parent (App) to see
  useEffect(() => {
    textRef.current = text;
  }, [text]);

  function handleInput() {
    if (editableRef.current) {
      const content = editableRef.current.innerText;
      console.log(content.split('\n'))
      setText(content);
    }
  }

  function setCaretToEnd() {
    const range = document.createRange();
    const sel = window.getSelection();
    range.selectNodeContents(editableRef.current!);
    range.collapse(false);
    sel!.removeAllRanges();
    sel!.addRange(range);
  }

  // Converts blocks to text
  function convertToText(blockArray: BlockType[]) {

    // Add necessary \n
    // let index = 0;
    // const newBlocks: string[] = [];
    // for (const block of blockArray) {
    //   newBlocks.push(block.content);

    //   // Is new line?
    //   if (block.content === "\n") {
    //     // Is next block new line? Add one more \n
    //     if (
    //       index + 1 < blockArray.length &&
    //       blockArray[index + 1].content === "\n"
    //     ) {
    //       newBlocks.push("\n");
    //     }
    //   }
    //   index++;
    // }

    // // Join the blocks (leave spaces around '\n')
    // let result = "";
    // let prevWasNewline = false;

    // for (const block of newBlocks) {
    //   const isNewline = block === "\n";

    //   if (!isNewline && result && !prevWasNewline) {
    //     result += " ";
    //   }

    //   result += block;
    //   prevWasNewline = isNewline;
    // }

    // return result;


    // Join the blocks (leave spaces around '\n')
    let result = "";
    let prevWasNewline = false;

    for (const block of blockArray) {
      const isNewline = block.content === "\n";

      if (!isNewline && result && !prevWasNewline) {
        result += " ";
      }

      result += block.content;
      prevWasNewline = isNewline;
    }

    return result;
  }

  function highlightWords(text: string) {
    const words = text.split(/(\s+)/);
    console.log("t",words);

    return words.map((word) => {
      // Is it \n\n\n...?
      if (/^(\n+)$/.test(word)) {
        // Count it
        const matches = word.match(/(\n+)/);
        let count = matches ? matches[0].length : 0;
        
        count = (count - 1) / 2;
        // console.log("count: ", count)
        
        // if(count > 1){
        //   count += count - 1;
        // }
        // console.log("newcount: ", count)

        // Return empty lines
        if (count > 0) {
          return Array.from({ length: count }).map(() => (
            <div>
              <br />
            </div>
          ));
        }

        // No empty lines -> space
        return word;
      } else {
        return <span className="word">{word}</span>;
      }
    });
  }

  return (
    <>
      <div className="textEditor-container">
        <div className="highlighted-layer">{highlightedWords}</div>
        <div
          className="editor-layer"
          contentEditable
          onInput={handleInput}
          ref={editableRef}
        ></div>
      </div>
    </>
  );
}
