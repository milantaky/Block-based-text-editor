import { useState, useRef, useEffect, ReactNode } from "react";
// import languages from "./wordCategories.tsx";
import "./BlockEditor.css";

type blockProps = {
  index: number;
  content: string;
  //   wordType: number;
};

export default function BlockEditor({
  text,
  blocksRef,
}: {
  text: string;
  blocksRef: React.MutableRefObject<string[]>;
}) {
  const [blocks, setBlocks] = useState<string[]>(convertToBlocks(text));
  const [inputText, setInputText] = useState("");
  const [inputIndex, setInputIndex] = useState(0); // This index says before which block the input is
  const [inputLineIndex, setInputLineIndex] = useState(0); // Which line the input is on (0 = first line)
  const inputRef = useRef<HTMLDivElement>(null);
  const changeBlockRef = useRef(false);
  const baseLineHeight = useRef(0); // Height of line on first render to compare if other lines have overflown
  const lines = splitLines(blocks); // Blocks converted into lines of blocks based on \n
  const setFirstRef = useRef(false);

  // When first rendered, check for line height and set input on end
  useEffect(() => {
    baseLineHeight.current =
      document.getElementsByClassName("line")[0].scrollHeight;

    if (!setFirstRef.current) {
      setInputIndex(lines[lines.length - 1].length);
      setInputLineIndex(lines.length - 1);
      setFirstRef.current = true;
    }
  }, []);

  // Focuses editor, and sets caret on end of input when editing it
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.textContent = inputText;

      // Sets caret on the end when pressing backspace on block (editing)
      if (changeBlockRef) {
        setCaretToEnd();
      }
    }
  }, [blocks, inputIndex, inputLineIndex, inputText]);

  // Update ref for parent
  useEffect(() => {
    blocksRef.current = blocks;
    // console.log(blocks)
  }, [blocks]);

  //   // Check for line-wrapping
  //   useEffect(() => {
  //     let changed = false;

  //     if (checkLineHeight(inputLineIndex)) {
  //       changed = true;
  //     }

  //     if (!changed && inputLineIndex > 0 && checkLineHeight(inputLineIndex - 1)) {
  //       changed = true;
  //     }
  //   }, [blocks, inputText]);

  function convertToBlocks(text: string) {
    if (text === "") return [];
    return text.split(" ");
  }

  // Checks if line has wrapped
  // When adding new line, \r get set as line divider, not \n!!
  // It is because there wouln't be a way to know if the line below is made to prevent wrapping or if it is a new line on purpose
  function checkLineHeight(line: number) {
    const domLines = document.getElementsByClassName("line");

    // Is checked line higher than base line
    if (domLines[line].scrollHeight <= baseLineHeight.current) {
      return false;
    }

    // If there already is new line, do nothing (prevents endless cycle of new lines)
    const insertIndex = countInsertIndex();
    if (blocks[insertIndex - 1] === "\n") {
      return false;
    }

    // Input not on end -> move last block to next line
    if (inputIndex !== lines[inputLineIndex].length) {
      // Is there already a wrapped line ("\r")? -> Swap "\r" with element before
      const possibleWrapIndex =
        insertIndex - inputIndex + lines[inputLineIndex].length;
      if (blocks[possibleWrapIndex] === "\r") {
        const newBlocks = [...blocks];
        [newBlocks[possibleWrapIndex], newBlocks[possibleWrapIndex - 1]] = [
          newBlocks[possibleWrapIndex - 1],
          newBlocks[possibleWrapIndex],
        ];
        setBlocks(newBlocks);
        return true;
      } else {
        addNewLine(possibleWrapIndex - 1, false, true);
        return true;
      }
    }

    addNewLine(countInsertIndex(), false, true);

    setInputIndex(0);
    setInputLineIndex(inputLineIndex + 1);
    return true;
  }

  // Adds new line to WHERE position
  // - If inputAlso, it makes a new block, before adding line with inputText
  // - Updates blocks state!
  // - Possibly updates inputText state!
  function addNewLine(where: number, inputAlso?: boolean, split?: boolean) {
    const newBlocks = [...blocks];

    if (inputAlso) {
      newBlocks.splice(where, 0, inputText.trim(), "\n");
      setInputText("");
    } else {
      if (split) {
        newBlocks.splice(where, 0, "\r");
      } else {
        newBlocks.splice(where, 0, "\n");
      }
    }

    setBlocks(newBlocks);
  }

  function setCaretToEnd() {
    const range = document.createRange();
    const sel = window.getSelection();
    range.selectNodeContents(inputRef.current!);
    range.collapse(false);
    sel!.removeAllRanges();
    sel!.addRange(range);
    changeBlockRef.current = false;
  }

  // Gets index to insert to, from counting blocks before index
  function countInsertIndex() {
    let count = 0;

    for (let i = 0; i < inputLineIndex; i++) {
      count += lines[i].length + 1;
    }

    count += inputIndex;

    return count;
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    switch (e.key) {
      case " ":
        e.preventDefault();
        if (inputText.trim() !== "") {
          // First Block
          if (blocks.length === 0) {
            setBlocks([inputText.trim()]);
          } else {
            // Input on end
            if (
              inputIndex === lines[inputLineIndex].length &&
              inputLineIndex === lines.length - 1
            ) {
              setBlocks([...blocks, inputText.trim()]);
            }
            // Input not on end
            else {
              const insertIndex = countInsertIndex();
              setBlocks((prevBlocks) => [
                ...prevBlocks.slice(0, insertIndex),
                inputText.trim(),
                ...prevBlocks.slice(insertIndex),
              ]);
            }
          }
          setInputText("");
          setInputIndex(inputIndex + 1);
        }
        break;

      case "Backspace":
        if (inputText === "") {
          e.preventDefault();

          if (blocks.length > 0) {
            // Input on start -> deleting line
            if (inputIndex === 0 && inputLineIndex !== 0) {
              const insertIndex = countInsertIndex();
              setBlocks(blocks.filter((_, index) => index !== insertIndex - 1));
              setInputIndex(lines[inputLineIndex - 1].length);
              setInputLineIndex(inputLineIndex - 1);
            } else {
              const insertIndex = countInsertIndex();
              setInputText(blocks[insertIndex - 1]);
              setInputIndex(inputIndex - 1);

              setBlocks(
                (prevBlocks) =>
                  inputIndex === prevBlocks.length &&
                  inputLineIndex === lines.length
                    ? prevBlocks.slice(0, -1) // Input on end
                    : prevBlocks.filter((_, index) => index !== insertIndex - 1) // Input elsewhere
              );

              changeBlockRef.current = true;
            }
          }
        }
        break;

      case "ArrowLeft":
        e.preventDefault();
        if (inputText === "" && inputIndex > 0) {
          setInputIndex(inputIndex - 1);
        }
        break;

      case "ArrowRight":
        e.preventDefault();
        if (inputText === "" && inputIndex < lines[inputLineIndex].length) {
          setInputIndex(inputIndex + 1);
        }
        break;

      case "ArrowUp":
        e.preventDefault();
        moveInputUp();

        // requestAnimationFrame(() => {
        //   const block = document.getElementsByClassName("line")[inputLineIndex];
        //   console.log(block.childNodes);
        // });

        // if (inputText === "" && inputLineIndex > 0) {
        //   setInputLineIndex(inputLineIndex - 1);

        //   // If lower line is longer, set input index to end of upper line
        //   if (inputIndex > lines[inputLineIndex - 1].length) {
        //     setInputIndex(lines[inputLineIndex - 1].length);
        //   }
        // }
        break;

      case "ArrowDown":
        e.preventDefault();
        if (inputText === "" && inputLineIndex < lines.length - 1) {
          setInputLineIndex(inputLineIndex + 1);

          // Is there line below?
          // Is upper line longer? -> set input index to end of lower line
          if (inputIndex > lines[inputLineIndex + 1].length) {
            setInputIndex(lines[inputLineIndex + 1].length);
          }
        }
        break;

      case "Enter":
        e.preventDefault();

        if (inputText !== "") {
          addNewLine(countInsertIndex(), true);
        } else {
          addNewLine(countInsertIndex());
        }

        setInputLineIndex(inputLineIndex + 1);
        setInputIndex(0);
        break;

      default:
        break;
    }
  }

  function moveInputUp() {
    const domLines = document.getElementsByClassName("line");

    // Is the line wrapped?
    if (domLines[inputLineIndex].clientHeight === baseLineHeight.current) {
      if (inputText === "" && inputLineIndex > 0) {
        setInputLineIndex(inputLineIndex - 1);

        // If lower line is longer, set input index to end of upper line
        if (inputIndex > lines[inputLineIndex - 1].length) {
          setInputIndex(lines[inputLineIndex - 1].length);
        }
      }
    } else {
      // The line is wrapped -> find fit in line above, if input not in first line
      const lineItems = domLines[inputLineIndex].children;

      // Input on first line
      const currentLine = lineItems[inputIndex] as HTMLElement;
      if (currentLine.offsetTop < baseLineHeight.current) {

        // Move input up
        if (inputText === "" && inputLineIndex > 0) {
          setInputLineIndex(inputLineIndex - 1);
        }

      } else {
        // Input in wrapped part -> move one line up and find suitable spot
        const inputOffset = currentLine.offsetLeft;
        const [splitLine, inputLine] = splitLineBlocks(lineItems);

        // Najit misto kde ma byt input
        let targetIndex = (inputLine > 0 && splitLine[inputLine - 1].length > 0) ? findClosestIndex(splitLine[inputLine - 1], inputOffset) : 0;
        if(inputLine > 0){
            for(let i = 0; i < inputLine - 1; i++){
                targetIndex += splitLine[i].length;
            }
        }

        setInputIndex(targetIndex);
      }
    }
  }

  function findClosestIndex(values: number[], referenceValue: number){
    let closestIndex = 0;
    let minDiff = Math.abs(values[0] - referenceValue);

    for(let i = 0; i < values.length; i++){
        const currentDiff = Math.abs(values[i] - referenceValue);
        if(currentDiff < minDiff){
            minDiff = currentDiff;
            closestIndex = i;
        }
    }

    return closestIndex
  }

  // Returns offset left array of blocks on lines
  function splitLineBlocks(blocks: HTMLCollection): [number[][], number] {
    let returnArray: number[][] = [[]];
    let lastLineOffset = blocks[0].offsetTop;
    let index = 0;
    let inputLine = 0;

    for (const block of blocks) {
        // console.log(block)
      if (lastLineOffset < block.offsetTop) {
        index++;
        lastLineOffset = block.offsetTop;
        returnArray[index] = [];
      } else {
        if(block.className === "input-box"){
            inputLine = index;
        }
        
        returnArray[index].push(block.offsetLeft);
      }
    }

    return [returnArray, inputLine];
  }

  function splitLines(blocks: string[]): string[][] {
    const lines: string[][] = [[]];
    let index = 0;

    blocks.forEach((block) => {
      // If \n add line, else add to previous line
      if (block === "\n" || block === "\r") {
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

  // Moves input to place of click.
  function handleClick(
    e: React.MouseEvent<HTMLDivElement>,
    lineIndex: number,
    blockIndex?: number
  ) {
    e.stopPropagation();

    // Clicked on block
    if (blockIndex !== undefined) {
      setInputLineIndex(lineIndex);
      setInputIndex(blockIndex + 1);
    }
    // Clicked elsewhere
    else {
      setInputLineIndex(lineIndex);

      // All blocks in clicked line
      const blocks =
        document.getElementsByClassName("line")[lineIndex].children;
      const clickedPositionX = e.clientX;

      let insertIndex = lines[lineIndex]?.length || 0;

      for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i] as HTMLElement;
        if (block.offsetLeft > clickedPositionX) {
          insertIndex = i;
          break;
        }
      }

      setInputIndex(insertIndex);
    }

    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function InputBox() {
    return (
      <div
        ref={inputRef}
        className="input-box"
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={handleKeyDown}
      />
    );
  }

  function Block({
    index,
    content,
    lineIndex,
  }: blockProps & { lineIndex: number }) {
    return (
      <div
        key={index}
        className="block"
        contentEditable
        suppressContentEditableWarning
        onClick={(e) => handleClick(e, lineIndex, index)}
        // onDoubleClick={() => console.log("Dvojklik na blok!")}
      >
        {content}
      </div>
    );
  }

  function Line({
    children,
    lineIndex,
  }: {
    children: ReactNode;
    lineIndex: number;
  }) {
    // ! pak jak se oddelaji ramecky, upravit!!!
    const minHeight = baseLineHeight.current - 16; // Base line height - 16px top, bottom padding

    return (
      <div
        key={lineIndex}
        className="line"
        style={{ minHeight: `${minHeight}px` }}
        onClick={(e) => handleClick(e, lineIndex)}
      >
        {children}
      </div>
    );
  }

  return lines.map((line, lineIndex) => {
    // No Blocks
    if (lines.length === 1 && line.length === 0) {
      return (
        <Line lineIndex={lineIndex}>
          <InputBox />
        </Line>
      );
    } else {
      // Empty line
      if (
        line.length === 0 &&
        inputIndex === 0 &&
        inputLineIndex === lineIndex
      ) {
        return (
          <Line lineIndex={lineIndex}>
            <InputBox />
          </Line>
        );
      }

      // Lines and blocks
      return (
        <Line lineIndex={lineIndex}>
          {line.map((word, wordIndex) => {
            // ========== Line without input
            if (lineIndex !== inputLineIndex) {
              return (
                <Block
                  key={wordIndex}
                  index={wordIndex}
                  content={word}
                  lineIndex={lineIndex}
                />
              );
            }

            // ========== Line with input
            // Input on start of line
            if (inputIndex === 0 && wordIndex === 0) {
              return (
                <>
                  <InputBox />
                  <Block
                    key={wordIndex}
                    index={wordIndex}
                    content={word}
                    lineIndex={lineIndex}
                  />
                </>
              );
            }
            // Input after this block
            else if (inputIndex - 1 === wordIndex) {
              return (
                <>
                  <Block
                    key={wordIndex}
                    index={wordIndex}
                    content={word}
                    lineIndex={lineIndex}
                  />
                  <InputBox />
                </>
              );
            }
            // Input elsewhere
            else {
              return (
                <Block
                  key={wordIndex}
                  index={wordIndex}
                  content={word}
                  lineIndex={lineIndex}
                />
              );
            }
          })}
        </Line>
      );
    }
  });
}
