import { useRef, useState, useEffect } from "react";
import type { BlockType, TextWordStylesMap } from "../../types";
import "./TextEditor.css";
import { earsTest } from "../../wordCategories";

const language = earsTest;
const languageWordsWithSpaces = getItemsWithSpaces(language);
const languageWordsWithSpacesConnected = new Set(
  languageWordsWithSpaces.map((word) => word.split(" ")[0])
); // Returns first words from list, and removes duplicates, is set because it has O(1) for lookup with .has

function getItemsWithSpaces(data: typeof language): string[] {
  const result: string[] = [];

  for (const category of Object.values(data)) {
    for (const item of category.items) {
      if (item.includes(" ")) result.push(item);
    }
  }

  return result;
}

export default function TextEditor({
  blocks,
  textRef,
  customization,
}: {
  blocks: BlockType[];
  textRef: React.MutableRefObject<string>;
  customization: {
    backgroundColor: string;
    fontFamily: string;
    fontSize: number;
    textWordStyles: TextWordStylesMap;
  };
}) {
  const [text, setText] = useState(convertToText(blocks));
  const editableRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);
  const words = text.split(/(\s+)/);
  const typeArray = getWordTypes();
  const highlightedWords = highlightWords(words);
  applyEarstestColors();

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

  // Adds styles of
  function applyEarstestColors() {
    const styleTag = document.createElement("style");
    let css = "";

    const styles = customization.textWordStyles;

    for (const [wordType, { color }] of Object.entries(styles)) {
      css += `.${wordType} { color: ${color}; }\n`;
    }

    styleTag.innerHTML = css;
    document.head.appendChild(styleTag);
  }

  // Removes . , ' from string
  function sanitizeBlock(word: string) {
    return word.replace(/[.,']/g, "");
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

        if (result === "") result += block.content;
        else result += " " + block.content;

        index++;
      } else {
        if (block.content === "\n") {
          if (
            index + 1 < blockArray.length &&
            blockArray[index + 1].content === "\n"
          ) {
            result += `<div><br></div>`;
          }
        } else result += `<div>${block.content}</div>`;

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

      if (!isNewline && result && !prevWasNewline) result += " ";

      result += block.content;
      prevWasNewline = isNewline;
    }
    return result;
  }

  function getWordTypes() {
    const helperArray = Array(words.length).fill("other");

    // If first could be multi word
    for (let wordsIndex = 0; wordsIndex < words.length; wordsIndex++) {
      const word = sanitizeBlock(words[wordsIndex]);

      if (languageWordsWithSpacesConnected.has(word)) {
        const possibleMatches = languageWordsWithSpaces.filter((w) =>
          w.startsWith(word)
        );

        // Is multiword word?
        for (const fullWord of possibleMatches) {
          const split = fullWord.split(" ");
          let match = true;

          // Words + spaces in between
          const checkLength = split.length * 2 - 1;

          // Longer than words array
          if (wordsIndex + checkLength > words.length - 1) {
            helperArray[wordsIndex] = "other";
            continue;
          }
          console.log(word, wordsIndex + checkLength, words.length);

          // Check rest with spaces
          for (let i = 0; i < split.length; i++) {
            const wordIndex = wordsIndex + i * 2;
            const spaceIndex = wordIndex + 1;

            // Check word
            if (sanitizeBlock(words[wordIndex]) !== split[i]) {
              match = false;
              break;
            }

            // Check space (except after last word)
            if (i < split.length - 1 && sanitizeBlock(words[spaceIndex]) !== " ") {
              match = false;
              break;
            }
          }

          if (match) {
            // Find category name
            let type = "";
            for (const [categoryKey, category] of Object.entries(language)) {
              if (category.items.has(fullWord)) {
                type = categoryKey; // např. "keywords"
              }
            }

            // Set helper
            for (let i = 0; i < split.length; i++) {
              const wordIndex = wordsIndex + i * 2;
              helperArray[wordIndex] = type;
            }
            wordsIndex += split.length * 2 - 1;

            continue;
          }
        }
      } else {
        // Return by category
        let set = false;
        for (const [categoryKey, category] of Object.entries(language)) {
          if (category.items.has(word)) {
            helperArray[wordsIndex] = categoryKey;
            set = true;
            break;
          }
        }
        if (!set) {
          helperArray[wordsIndex] = "other";
        }
      }
    }

    return helperArray;
  }

  function highlightWords(words: string[]) {
    let isFirstRender = false;

    // Different rendering for first render (browser adds )
    if (firstRender.current && blocks.length !== 0) {
      isFirstRender = true;
      firstRender.current = false;
    }

    const newHighlighted = words.map((word, index) => {
      // Is it \n\n\n...? -> Count it
      if (/^(\n+)$/.test(word)) {
        const matches = word.match(/(\n+)/);
        let count = matches ? matches[0].length : 0;

        if (isFirstRender) {
          if (count > 1) count += count - 1;
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

        // No empty lines -> space (     \n)
        return word;
        // } else return <span className="word">{word}</span>;
      } else return <span className={typeArray[index]}>{word}</span>;
    });

    return newHighlighted;
  }

  return (
    <>
      <div className="textEditor-container">
        <div
          className="highlighted-layer"
          style={{
            fontFamily: customization.fontFamily,
            backgroundColor: customization.backgroundColor,
            fontSize: customization.fontSize,
          }}
        >
          {highlightedWords}
        </div>
        <div
          className="editor-layer"
          contentEditable
          spellCheck={false}
          autoCorrect="off"
          onInput={handleInput}
          style={{
            fontFamily: customization.fontFamily,
            fontSize: customization.fontSize,
          }}
          ref={editableRef}
        ></div>
      </div>
    </>
  );
}
