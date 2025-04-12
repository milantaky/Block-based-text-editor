import { useRef, useState, useEffect } from "react";
import "./TextEditor.css";

export default function TextEditor({ blocks, textRef }: { blocks: string[], textRef: React.MutableRefObject<string> }) {
  const [text, setText] = useState(convertToText(blocks));
  const editableRef = useRef<HTMLDivElement>(null);

  // On first render -> transform BLOCKS to TEXT
  useEffect(() => {
    if (editableRef.current) {
      editableRef.current.innerText = convertToText(blocks);
      editableRef.current.focus();
    }
  }, []);

  useEffect(() => {
    textRef.current = text;
  }, [text]);

  function handleInput() {
    if (editableRef.current) {
      const content = editableRef.current.innerText;
      setText(content);
    }
  }

  function convertToText(blockArray: string[]) {
    return blockArray.join(" ");
  }

  function highlightWords(text: string) {
    const words = text.split(/(\s+)/);
    console.log(words);

    return words.map((word) => {
      // Is it \n\n\n...?
      if (/^(\n+)$/.test(word)) {
        // Count it
        const matches = word.match(/(\n+)/);
        let count = matches ? matches[0].length : 0;

        // Browser adds too many \n
        count = (count - 1) / 2;

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
  };

  return (
    <>
      <div className="textEditor-container">
        <div className="highlighted-layer">{highlightWords(text)}</div>
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
