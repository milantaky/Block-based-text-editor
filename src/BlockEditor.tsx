import "./BlockEditor.css";
import { useState, useRef, useEffect, ReactNode } from "react";
import type { BlockType, blockProps } from "./types";
// import { DndContext, useDraggable, useDroppable, closestCorners } from "@dnd-kit/core";
// import {
//   SortableContext,
//   horizontalListSortingStrategy,
// } from "@dnd-kit/sortable";
// import languages from "./wordCategories.tsx";

export default function BlockEditor({
  text,
  blocksRef,
}: {
  text: string;
  blocksRef: React.MutableRefObject<BlockType[]>;
}) {
  const [blocks, setBlocks] = useState<BlockType[]>(convertToBlocks(text));
  const [nextBlockIndex, setNextBlockIndex] = useState(text.split("").length);
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

  // Update ref for parent
  useEffect(() => {
    blocksRef.current = blocks;
  }, [blocks]);

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

  // Splits text into blocks of words, gives them index, and category (wordType)
  // Runs when the block editor is first rendered
  function convertToBlocks(text: string, addIndex: number = 0) {
    if (text === "") return [];

    const newBlocks: BlockType[] = [];
    const splitBlocks = text.split(" ").flatMap((item) => {
      const parts = item.split("\n");
      return parts.flatMap((part, index) => {
        return index < parts.length - 1 ? [part, "\n"] : [part];
      });
    });

    // Go through each word, make a block, and add it to blocks
    splitBlocks.map((block, index) => {
      const newBlock = {
        index: index + addIndex,
        content: block,
        wordType: getWordType(block),
      };

      newBlocks[index] = newBlock;
    });

    return newBlocks;
  }

  // TODO
  // Gets word type
  function getWordType(word: string) {
    return 0;
  }

  // Adds new line to WHERE position
  // - If inputAlso, it makes a new block, before adding line with inputText
  // - Updates blocks state!
  // - Possibly updates inputText state!
  // Maybe adds one more index, but that's not a problem
  function addNewLine(where: number, inputAlso?: boolean) {
    const newBlocks = [...blocks];

    if (inputAlso) {
      newBlocks.splice(where, 0, makeBlock(inputText.trim()), {
        index: nextBlockIndex + 1,
        content: "\n",
        wordType: 0,
      });
      setInputText("");
    } else {
      newBlocks.splice(where, 0, {
        index: nextBlockIndex + 1,
        content: "\n",
        wordType: 0,
      });
    }

    setBlocks(newBlocks);
    setNextBlockIndex(nextBlockIndex + 2);
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
            setBlocks([makeBlock(inputText.trim())]);
          } else {
            // Input on end
            if (
              inputIndex === lines[inputLineIndex].length &&
              inputLineIndex === lines.length - 1
            ) {
              setBlocks((prev) => [...prev, makeBlock(inputText.trim())]);
            }
            // Input not on end
            else {
              const insertIndex = countInsertIndex();
              setBlocks((prevBlocks) => [
                ...prevBlocks.slice(0, insertIndex),
                makeBlock(inputText.trim()),
                ...prevBlocks.slice(insertIndex),
              ]);
            }
          }
          setInputText("");
          setInputIndex(inputIndex + 1);
          //   setNextBlockIndex(nextBlockIndex + 1);
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
              setInputText(blocks[insertIndex - 1].content);
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
        break;

      case "ArrowDown":
        e.preventDefault();
        moveInputDown();
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

  function makeBlock(text: string) {
    const newBlock: BlockType = {
      index: nextBlockIndex,
      content: text,
      wordType: getWordType(text),
    };

    setNextBlockIndex(nextBlockIndex + 1);
    return newBlock;
  }

  function moveInputUp() {
    const domLines = document.getElementsByClassName("line");
    const lineItems = domLines[inputLineIndex].children;

    const currentLineInput = lineItems[inputIndex] as HTMLElement;
    const [splitLine, inputLine, inputIndexOnLine] = splitLineBlocks(lineItems);

    const inputOffset = currentLineInput.offsetLeft;

    // Input on first line
    if (inputLine === 0) {
      if (inputText === "" && inputLineIndex > 0) {
        //Empty line above
        if (lines[inputLineIndex - 1].length === 0) {
          setInputLineIndex(inputLineIndex - 1);
          setInputIndex(0);
          return;
        }

        // Previous line blocks
        const [splitLinePrevious] = splitLineBlocks(
          domLines[inputLineIndex - 1].children
        );
        const targetLine = splitLinePrevious[splitLinePrevious.length - 1];
        let targetLineIndex = findClosestIndex(targetLine, inputOffset);

        // Add all blocks before
        for (let i = 0; i < splitLinePrevious.length - 1; i++) {
          targetLineIndex += splitLinePrevious[i].length;
        }

        setInputIndex(targetLineIndex);
        setInputLineIndex(inputLineIndex - 1);
      }

      return;
    }

    // Line wrapped
    if (domLines[inputLineIndex].clientHeight !== baseLineHeight.current) {
      const targetIndex = findTargetInputIndexUp(
        inputIndexOnLine,
        splitLine,
        inputOffset,
        inputLine
      );

      setInputIndex(targetIndex);
    }
  }

  // TODO: handle inputText?
  function moveInputDown() {
    const domLines = document.getElementsByClassName("line");
    const lineItems = domLines[inputLineIndex].children;

    const currentLineInput = lineItems[inputIndex] as HTMLElement;
    const [splitLine, inputLine, inputIndexOnLine] = splitLineBlocks(lineItems);

    const inputOffset = currentLineInput.offsetLeft;

    const lineWrapped =
      domLines[inputLineIndex].clientHeight !== baseLineHeight.current &&
      inputLine !== splitLine.length - 1;

    if (lineWrapped) {
      const targetIndex = findTargetInputIndexDown(
        inputIndexOnLine,
        splitLine,
        inputOffset,
        inputLine
      );

      setInputIndex(targetIndex);
    } else {
      // Move input down
      if (inputText === "" && inputLineIndex !== lines.length - 1) {
        if (lines[inputLineIndex + 1].length === 0) {
          setInputLineIndex(inputLineIndex + 1);
          setInputIndex(0);
          return;
        }
        const [splitLineNext] = splitLineBlocks(
          domLines[inputLineIndex + 1].children
        );

        setInputIndex(findClosestIndex(splitLineNext[0], inputOffset));
        setInputLineIndex(inputLineIndex + 1);
      }
    }
  }

  // Finds the target input in line below, and adds blocks before
  function findTargetInputIndexDown(
    inputIndexOnLine: number,
    splitLine: number[][],
    inputOffset: number,
    inputLine: number
  ) {
    let targetIndex = 0;
    if (inputIndexOnLine > 0 && splitLine.length - 1 > inputLine) {
      targetIndex = findClosestIndex(splitLine[inputLine + 1], inputOffset);
    }

    // Count all blocks before the target line and index
    for (let i = 0; i <= inputLine; i++) {
      targetIndex += splitLine[i].length;
    }

    return targetIndex;
  }

  // Finds the target input in line above, and adds blocks before
  function findTargetInputIndexUp(
    inputIndexOnLine: number,
    splitLine: number[][],
    inputOffset: number,
    inputLine: number
  ) {
    // Count the final index
    let targetIndex =
      inputIndexOnLine > 0 && splitLine[inputLine - 1].length > 0
        ? findClosestIndex(splitLine[inputLine - 1], inputOffset)
        : 0;

    // Count all blocks before
    if (inputLine > 0) {
      for (let i = 0; i < inputLine - 1; i++) {
        targetIndex += splitLine[i].length;
      }
    }

    return targetIndex;
  }

  // Finds the smallest difference in block positions to input position
  function findClosestIndex(values: number[], inputPosition: number) {
    if (inputPosition > values[values.length - 1]) {
      return values.length;
    }

    let closestIndex = 0;
    let minDiff = Math.abs(values[0] - inputPosition);

    for (let i = 0; i < values.length; i++) {
      const currentDiff = Math.abs(values[i] - inputPosition);
      if (currentDiff < minDiff) {
        minDiff = currentDiff;
        closestIndex = i;
      }
    }

    return closestIndex;
  }

  // Splits wrapped line into separate blocks (their position)
  // Returns offsetLeft array of blocks on lines and an index of line input is on, and index on the line
  function splitLineBlocks(
    blocks: HTMLCollection
  ): [number[][], number, number] {
    const returnArray: number[][] = [[]];
    let lastLineOffset = (blocks[0] as HTMLElement).offsetTop;
    let lineNumber = 0; // Which line we are on in wrapped line
    let inputLine = 0; // Which line the input is on
    let inputIndexOnLine = 0; // Input index on line
    let indexOnLine = 0;

    for (const block of blocks) {
      // New Line?
      if (lastLineOffset < (block as HTMLElement).offsetTop) {
        lineNumber++;
        indexOnLine = 0;
        lastLineOffset = (block as HTMLElement).offsetTop;

        // Is it input?
        if (block.className === "input-box") {
          inputLine = lineNumber;
          inputIndexOnLine = indexOnLine;
          returnArray[lineNumber] = [];
          continue;
        }

        returnArray[lineNumber] = [];
      }

      if (block.className === "input-box") {
        inputLine = lineNumber;
        inputIndexOnLine = indexOnLine;
        continue;
      }

      indexOnLine++;
      returnArray[lineNumber].push((block as HTMLElement).offsetLeft);
    }

    return [returnArray, inputLine, inputIndexOnLine];
  }

  // Splits blocks into separate lines
  function splitLines(blocks: BlockType[]): BlockType[][] {
    const lines: BlockType[][] = [[]];
    let index = 0;

    blocks.forEach((block) => {
      // If \n add line, else add to previous line
      if (block.content === "\n") {
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

  // Handles pasting of text through Crtl/Cmd + v -> splits the text into blocks and adds them into state
  function handlePaste(e: React.ClipboardEvent<HTMLDivElement>) {
    e.preventDefault();

    // Gets text from clipboard and converts it to blocks with correct indices
    const pastedText = e.clipboardData.getData("text");
    let newBlocks = convertToBlocks(pastedText, nextBlockIndex);

    // Removes empty blocks (spaces)
    newBlocks = newBlocks.filter((block) => block.content !== "");

    // Inserts pasted blocks into blocks state
    const insertIndex = countInsertIndex();
    setBlocks((prevBlocks) => [
      ...prevBlocks.slice(0, insertIndex),
      ...newBlocks,
      ...prevBlocks.slice(insertIndex),
    ]);

    setInputIndex(inputIndex + newBlocks.length);
    setNextBlockIndex(nextBlockIndex + newBlocks.length);
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

  function Block({ block, lineIndex }: blockProps & { lineIndex: number }) {
    return (
      <div
        className="block"
        data-index={block.index}
        data-lineindex={lineIndex}
        // contentEditable
        // suppressContentEditableWarning
        // onDoubleClick={() => console.log("akjscnkasncj")}
      >
        {block.content}
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
        className="line"
        data-index={lineIndex}
        style={{ minHeight: `${minHeight}px` }}
      >
        {children}
      </div>
    );
  }

  function handleEditorClick(e: React.MouseEvent) {
    const clicked = e.target as HTMLElement;
    //clicked.children

    // If clicked on block
    if (clicked.classList.contains("block")) {
      // Get indices from data attributes and convert them to number
      const blockIndex = parseInt(clicked.dataset.index!, 10);
      const lineIndex = parseInt(clicked.dataset.lineindex!, 10);

      setInputIndex(blockIndex + 1);
      setInputLineIndex(lineIndex);
      return;
    } else if (clicked.classList.contains("line")) {
    
      const lineIndex = clicked.dataset.index;
      console.log("Kliknuto na line:", lineIndex);

      return;
    } else {
      console.log("Kliknuto mimo bloky");
    }
  }

  function renderLine(line: BlockType[], lineIndex: number) {
    // No Blocks
    if (lines.length === 1 && line.length === 0) {
      return (
        <Line key={lineIndex} lineIndex={lineIndex}>
          <InputBox key={0} />
        </Line>
      );
    }

    // Empty line
    if (line.length === 0 && inputIndex === 0 && inputLineIndex === lineIndex) {
      return (
        <Line key={lineIndex} lineIndex={lineIndex}>
          <InputBox key={0} />
        </Line>
      );
    }

    return (
      <Line key={lineIndex} lineIndex={lineIndex}>
        {line.map((block, wordIndex) =>
          renderBlock(block, wordIndex, lineIndex)
        )}
      </Line>
    );
  }

  function renderBlock(block: BlockType, wordIndex: number, lineIndex: number) {
    // Line without input
    if (lineIndex !== inputLineIndex) {
      return <Block key={block.index} block={block} lineIndex={lineIndex} />;
    }

    // Input on start of line
    if (inputIndex === 0 && wordIndex === 0) {
      return (
        <>
          <InputBox key={nextBlockIndex} />
          <Block key={block.index} block={block} lineIndex={lineIndex} />
        </>
      );
    }

    // Input after this block
    if (inputIndex - 1 === wordIndex) {
      return (
        <>
          <Block key={block.index} block={block} lineIndex={lineIndex} />
          <InputBox key={nextBlockIndex} />
        </>
      );
    }

    // Input elsewhere
    return <Block key={block.index} block={block} lineIndex={lineIndex} />;
  }

  return (
    <>
      <div
        className="blockEditor-container"
        onPaste={(e) => handlePaste(e)}
        onMouseDown={(e) => handleEditorClick(e)}
      >
        {/* <DndContext collisionDetection={closestCorners}> */}
        {lines.map((line, lineIndex) => renderLine(line, lineIndex))}
        {/* </DndContext> */}
      </div>
    </>
  );
}
