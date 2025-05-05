import { useRef, useState, useEffect } from "react";
import type { BlockType } from "../../types";
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
  const firstRender = useRef(true);
  const highlightedWords = highlightWords(text);

  // On first render -> transform BLOCKS to TEXT, set caret to end
  useEffect(() => {
    if (editableRef.current) {
      editableRef.current.innerHTML = convertForRef(blocks);
      editableRef.current.focus();
    }

    setCaretToEnd();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sets current text to ref for parent (App) to see
  useEffect(() => {
    textRef.current = editableRef.current!.innerText;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  function handleInput() {
    if (editableRef.current) {
      const content = editableRef.current.innerText;
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

  // For first render
  function convertForRef(blockArray: BlockType[]) {
    let result = "";
    let firstLine = true;
    let index = 0;

    for (const block of blockArray) {
      if (firstLine) {
        if (block.content === "\n") {
          firstLine = false;
          index++;
          continue;
        }

        if (result === "") {
          result += block.content;
        } else {
          result += " " + block.content;
        }

        index++;
      } else {
        if (block.content === "\n") {
          if (
            index + 1 < blockArray.length &&
            blockArray[index + 1].content === "\n"
          ) {
            result += `<div><br></div>`;
          }
        } else {
          result += `<div>${block.content}</div>`;
        }

        index++;
      }
    }

    return result;
  }

  // Converts blocks to text
  function convertToText(blockArray: BlockType[]) {
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
    let isFirstRender = false;

    // Different rendering for first render (browser adds )
    if (firstRender.current && blocks.length !== 0) {
      isFirstRender = true;
      firstRender.current = false;
    }

    return words.map((word) => {
      // Is it \n\n\n...?
      if (/^(\n+)$/.test(word)) {
        // Count it
        const matches = word.match(/(\n+)/);
        let count = matches ? matches[0].length : 0;

        if (isFirstRender) {
          if (count > 1) {
            count += count - 1;
          }
        } else {
          count = (count - 1) / 2;

          if (count > 0) {
            return Array.from({ length: count }).map(() => (
              <div>
                <br />
              </div>
            ));
          }
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
