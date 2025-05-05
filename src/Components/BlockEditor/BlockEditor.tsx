import { earsTest } from "../../wordCategories.tsx";
import { useState, useRef, useEffect } from "react";
import type { BlockStylesMap, BlockType } from "../../types.tsx";
import "./BlockEditor.css";

import SortableBlock from "./SortableBlock/SortableBlock.tsx";
import PrefabSection from "./Prefab/PrefabSection.tsx";
import InputBox from "./InputBox/InputBox.tsx";
import Line from "./Line/Line.tsx";

import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  rectIntersection,
  pointerWithin,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";

const language = earsTest; // Selected language -> EARS
const typeKeyMap = createTypeToKeyMap(language);
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

function createTypeToKeyMap(language: typeof earsTest): Record<number, string> {
  const map: Record<number, string> = {};
  for (const key of Object.keys(language)) {
    map[language[key].type] = key;
  }
  return map;
}

export default function BlockEditor({
  text,
  blocksRef,
  baseLineHeight,
  blhSet,
  prefabVisible,
  customization,
}: {
  text: string;
  blocksRef: React.MutableRefObject<BlockType[]>;
  baseLineHeight: React.MutableRefObject<number>;
  blhSet: React.MutableRefObject<boolean>;
  prefabVisible: boolean;
  customization: {
    backgroundColor: string;
    fontFamily: string;
    boxShadow: boolean;
    blockStyles: BlockStylesMap;
  };
}) {
  const [blocks, setBlocks] = useState<BlockType[]>(convertToBlocks(text));
  const [nextBlockIndex, setNextBlockIndex] = useState(text.split("").length);
  const [inputText, setInputText] = useState("");
  const [inputIndex, setInputIndex] = useState(0); // This index says before which block the input is
  const [inputLineIndex, setInputLineIndex] = useState(0); // Which line the input is on (0 = first line)
  const inputRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const changeBlockRef = useRef(false);
  const lines = splitLines(blocks); // Blocks converted into lines of blocks based on \n
  const setFirstRef = useRef(false);
  const [activeBlock, setActiveBlock] = useState<BlockType | null>(null);
  const [selectedBlocks, setSelectedBlocks] = useState<BlockType[]>([]);
  const [firstSelectedBlockIndex, setFirstSelectedBlockIndex] = useState<
    [number, number]
  >([-1, -1]); // [inputIndex, inputLineIndex]

  // When first rendered, check for line height and set input on end
  useEffect(() => {
    if (!blhSet.current) {
      baseLineHeight.current =
        document.getElementsByClassName("line")[0].scrollHeight;
      blhSet.current = true;
    }

    if (!setFirstRef.current) {
      setInputIndex(lines[lines.length - 1].length);
      setInputLineIndex(lines.length - 1);
      setFirstRef.current = true;
    }
  }, []);

  // Update ref for parent, check is some blocks can be joined -> I know I set state in useEffect for that state, but no looping
  useEffect(() => {
    blocksRef.current = blocks;

    const newBlocks = checkForWordWithSpaces(blocks);
    if (newBlocks !== false) setBlocks(newBlocks);
  }, [blocks]);

  // Focuses editor, and sets caret on end of input when editing it
  useEffect(() => {
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.textContent = inputText;
      }
      if (changeBlockRef) setCaretToEnd();
    }, 0);
  }, [blocks, inputIndex, inputLineIndex, inputText, selectedBlocks]);

  // Splits text into blocks of words, gives them index, and category (wordType)
  // Runs when the block editor is first rendered
  function convertToBlocks(text: string, addIndex: number = 0) {
    if (text === "") return [];

    const newBlocks: BlockType[] = [];

    // Splits by lines -> excludes extra lines added -> filters empty blocks
    let prevAdded = false;
    const splitLines = text
      .split("\n")
      .flatMap((block) => {
        if (block === "") {
          if (!prevAdded) {
            prevAdded = true;
            return "\n";
          }
          prevAdded = false;
          return [];
        }
        return block;
      })
      .filter((block) => block !== "");

    // Add lines
    const splitBlocksss = splitLines.flatMap((block, index) => {
      if (index + 1 !== splitLines.length) {
        if (splitLines[index + 1] !== "\n") return [block, "\n"];
      }
      return block;
    });

    // Split blocks on lines
    const splitBlocks = splitBlocksss.flatMap((block) => {
      if (block.includes(" ")) return block.split(" ");
      return block;
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

  // Checks blocks if tere are any possible blocks to be joined (for exapmle: state [LGS] [Warning] [System] -> [LGS Warning System]), if so, set new blocks and update input position. Returns newBlocks if some joined, or false if not
  function checkForWordWithSpaces(blockArray: BlockType[]) {
    let currentLine = 0;
    let newBlocks = blockArray;
    let changed = false;

    for (let startIndex = 0; startIndex < newBlocks.length; startIndex++) {
      const block = sanitizeBlock(newBlocks[startIndex].content);

      if (block === "\n") {
        currentLine++;
        continue;
      }

      if (block.includes(" ")) continue;

      // EARS
      if (block === "req:") {
        if (startIndex + 1 < newBlocks.length) {
          const nextBlock = newBlocks[startIndex + 1].content;

          // Is number?
          if (!isNaN(Number(nextBlock))) {
            newBlocks = mergeBlocks(
              newBlocks,
              startIndex,
              startIndex + 2,
              true
            );

            if (currentLine === inputLineIndex) {
              const inputIndexInBlocks = findInputBlocksIndex();
              if (inputIndexInBlocks > startIndex)
                setInputIndex(inputIndex - 1);
            }

            changed = true;
          }
        }
        continue;
      }

      // Is in list of possible multi word blocks?
      if (languageWordsWithSpacesConnected.has(block)) {
        // Find which multi word block it can be
        const possibleBlocks = languageWordsWithSpaces.filter((word) =>
          word.includes(block)
        );

        // Find if blocks after match the possible block
        for (let i = 0; i < possibleBlocks.length; i++) {
          if (
            startIndex + possibleBlocks[i].split(" ").length >
            newBlocks.length
          )
            break;

          const splitWord = possibleBlocks[i]!.split(" ");
          let match = true;

          // Is this the right word?
          for (let offset = 0; offset < splitWord.length; offset++) {
            const nextBlock = sanitizeBlock(
              newBlocks[startIndex + offset].content
            );

            // If the words don't match
            if (
              !(
                startIndex + offset < newBlocks.length &&
                splitWord[offset] === nextBlock
              )
            ) {
              match = false;
              break;
            }
          }

          // The blocks match the word with spaces
          if (match) {
            // Join the blocks and use index of last block
            newBlocks = mergeBlocks(
              newBlocks,
              startIndex,
              startIndex + splitWord.length
            );

            // Handle input if on same line
            if (currentLine === inputLineIndex) {
              const inputIndexInBlocks = findInputBlocksIndex();
              if (inputIndexInBlocks > startIndex)
                setInputIndex(inputIndex - splitWord.length + 1);
            }

            changed = true;
            break;
          }
        }
      }
    }

    return changed ? newBlocks : false;
  }

  // Removes . , ' from string
  function sanitizeBlock(word: string) {
    return word.replace(/[.,']/g, "");
  }

  // Merges blocks from start to end indices, uses index of last block as new index and sets new blocks
  function mergeBlocks(
    blockArray: BlockType[],
    start: number,
    end: number,
    isRequirement: boolean = false
  ) {
    const blocksToMerge = blockArray.slice(start, end);

    const newContent = blocksToMerge.map((block) => block.content).join(" ");

    const newBlock: BlockType = {
      index: blocksToMerge[blocksToMerge.length - 1].index,
      content: newContent,
      wordType: isRequirement ? -1 : getWordType(newContent),
    };

    const newBlocks = [
      ...blockArray.slice(0, start),
      newBlock,
      ...blockArray.slice(end),
    ];

    return newBlocks;
  }

  // Counts the index of input where it should be in blocks array
  function findInputBlocksIndex() {
    let returnIndex = 0;

    for (let i = 0; i < lines.length; i++) {
      if (i < inputLineIndex) {
        returnIndex += lines[i].length + 1; // + \n
      } else break;
    }

    return returnIndex + inputIndex; // Current input index on line
  }

  // Gets word type
  function getWordType(word: string) {
    for (const [, data] of Object.entries(language)) {
      if (data.items.has(sanitizeBlock(word))) {
        return data.type;
      }
    }

    console.log(`"${word}" not found in any category.`);
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

  function makeBlock(text: string, type?: number) {
    const newBlock: BlockType = {
      index: nextBlockIndex,
      content: text,
      wordType: type === undefined ? getWordType(text) : type,
    };

    setNextBlockIndex(nextBlockIndex + 1);
    return newBlock;
  }

  // TODO: handle inputText?
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
      console.log("UP SL:", splitLine)
      console.log("UP TI:", targetIndex, inputOffset, inputLine)
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
        console.log("newLine");
        
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

  // Handles pressed keys
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
        }
        break;

      // With shift key -> deletes block
      case "Backspace":
        if (inputText === "") {
          e.preventDefault();

          if (blocks.length > 0) {
            const insertIndex = countInsertIndex();

            // Shift -> delete block
            if (e.shiftKey) {
              // Blocks are selected -> delete them
              if (selectedBlocks.length !== 0) {
                setBlocks(
                  blocks.filter(
                    (block) =>
                      !selectedBlocks.some(
                        (selected) => selected.index === block.index
                      )
                  )
                );
                setInputIndex(firstSelectedBlockIndex[0]);
                setInputLineIndex(firstSelectedBlockIndex[1]);
                setFirstSelectedBlockIndex([-1, -1]);
                setSelectedBlocks([]);

                return;
              }

              if (inputIndex !== 0) {
                setInputIndex(inputIndex - 1);
                setBlocks(
                  blocks.filter((block) => block.index !== insertIndex - 1)
                );

                return;
              }
            }

            // Input on start -> deleting line
            if (inputIndex === 0 && inputLineIndex !== 0) {
              setBlocks(blocks.filter((_, index) => index !== insertIndex - 1));
              setInputIndex(lines[inputLineIndex - 1].length);
              setInputLineIndex(inputLineIndex - 1);
            } else {
              setInputText(blocks[insertIndex - 1].content);
              setInputIndex(inputIndex - 1 >= 0 ? inputIndex - 1 : 0);

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
        } else {
          if (e.shiftKey) setInputText("");
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

  // Handles pasting of text through Crtl/Cmd + v -> splits the text into blocks and adds them into state
  function handlePaste(e: React.ClipboardEvent<HTMLDivElement>) {
    e.preventDefault();

    // Unselects blocks
    if (selectedBlocks.length !== 0) setSelectedBlocks([]);

    // Gets text from clipboard and converts it to blocks with correct indices
    const pastedText = e.clipboardData.getData("text");
    let newBlocks = convertToBlocks(pastedText, nextBlockIndex);

    // Removes empty blocks (spaces)
    newBlocks = newBlocks.filter((block) => block.content !== "");

    // Inserts pasted blocks into blocks state
    const insertIndex = countInsertIndex();
    newBlocks = [
      ...blocks.slice(0, insertIndex),
      ...newBlocks,
      ...blocks.slice(insertIndex),
    ];

    const joinedBlocks = checkForWordWithSpaces(newBlocks);

    // Did some blocks join?
    if (!joinedBlocks) {
      setBlocks(newBlocks);
    } else {
      setBlocks(joinedBlocks);
      newBlocks = joinedBlocks;
    }

    // Count new lines
    const newLineCount = newBlocks.reduce((acc, block) => {
      return acc + (block.content.includes("\n") ? 1 : 0);
    }, 0);

    if (newLineCount === 0) setInputIndex(inputIndex + newBlocks.length);
    else {
      let index = 0;
      for (let i = newBlocks.length - 1; i >= 0; i--) {
        index++;
        if (newBlocks[i].content === "\n") break;
      }

      setInputIndex(index - 1);
      setInputLineIndex(inputLineIndex + newLineCount);
    }

    setNextBlockIndex(nextBlockIndex + newBlocks.length);
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

  // Handles copying (only selected blocks)
  function handleCopy() {
    if (selectedBlocks.length !== 0) {
      const copiedContent = convertToText(selectedBlocks);
      navigator.clipboard.writeText(copiedContent);
    }
  }

  // Todo vyresit inputtext?
  function findPositionOfClickOnLine(
    clickX: number,
    clickY: number,
    lineHeight: number,
    items: HTMLCollection
  ) {
    // Line not wrapped
    if (lineHeight <= baseLineHeight.current) {
      const offsetArray = Array.from(items).map(
        (item) => (item as HTMLElement).offsetLeft
      );
      return findClosestIndex(offsetArray, clickX);
    } else {
      const blockOffsetArray: number[] = [];
      let blocksBefore = 0;
      let reference = -1;

      for (let i = 0; i < items.length; i++) {
        const currentBlockOffset =
          (items[i] as HTMLElement).offsetTop +
          (items[i] as HTMLElement).offsetHeight;

        // While not on correct line
        if (clickY > currentBlockOffset) {
          blocksBefore++;
          continue;
        } else {
          // Correct line, find place to fit input based on offsetLeft
          if (reference === -1) {
            reference = currentBlockOffset;
          }

          // Did we move to next line? Return last index (clicked on end of line)
          if (currentBlockOffset === reference) {
            blockOffsetArray.push((items[i] as HTMLElement).offsetLeft);
          } else {
            break;
          }
        }
      }

      return findClosestIndex(blockOffsetArray, clickX) + blocksBefore;
    }
  }

  // Adds clicked block to selected blocks
  function selectBlock(clicked: HTMLElement) {
    const blockIndex = parseInt(clicked.dataset.index!, 10);
    const indexOnLine = parseInt(clicked.dataset.indexonline!, 10);
    const lineIndex = parseInt(clicked.dataset.lineindex!, 10);

    // Empty -> select block
    if (selectedBlocks.length === 0) {
      setSelectedBlocks([blocks.find((block) => block.index === blockIndex)!]);
      setFirstSelectedBlockIndex([-1, -1]);
    }

    // Selected one block already -> if not clicked on the same, select all blocks in between
    if (selectedBlocks.length === 1) {
      // Clicked on the same block
      if (selectedBlocks[0].index === blockIndex) {
        setSelectedBlocks([]);
        setFirstSelectedBlockIndex([-1, -1]);
        return;
      }

      const existingIndex = blocks.findIndex(
        (block) => block.index === selectedBlocks[0].index
      );
      const currentIndex = blocks.findIndex(
        (block) => block.index === blockIndex
      );

      // Smaller index is start
      const start = Math.min(existingIndex, currentIndex);
      const end = Math.max(existingIndex, currentIndex);

      // Clicked before the already selected block, update future input in case of deleting
      if (currentIndex < existingIndex) {
        setFirstSelectedBlockIndex([indexOnLine, lineIndex]);
      }

      const newSelectedBlocks = blocks.slice(start, end + 1);

      setSelectedBlocks(newSelectedBlocks);
      return;
    }

    // Many selected -> select only the clicked one
    const selectedBlock = blocks.find((block) => block.index === blockIndex);
    setSelectedBlocks([selectedBlock!]);
    setFirstSelectedBlockIndex([indexOnLine, lineIndex]);
  }

  // Handles mouse click in editor
  function handleEditorClick(e: React.MouseEvent) {
    const clicked = e.target as HTMLElement;

    // Clicked on block
    if (clicked.classList.contains("block")) {
      // Clicked with Shift
      if (e.shiftKey) {
        selectBlock(clicked);
        return;
      }

      // Get indices from data attributes and convert them to number
      const blockIndex = parseInt(clicked.dataset.index!, 10);
      const blockIndexOnLine = parseInt(clicked.dataset.indexonline!, 10);
      const lineIndex = parseInt(clicked.dataset.lineindex!, 10);

      // Did not click on selected block
      if (!selectedBlocks.some((block) => block.index === blockIndex))
        setSelectedBlocks([]);

      setInputIndex(blockIndexOnLine + 1);
      setInputLineIndex(lineIndex);
      setTimeout(() => inputRef.current?.focus(), 0);

      return;
    }

    setSelectedBlocks([]);

    if (clicked.classList.contains("line")) {
      const lineIndex = parseInt(clicked.dataset.index!, 10);

      // Find closest space between blocks in place of click
      let targetIndex = findPositionOfClickOnLine(
        e.clientX,
        e.clientY + editorRef.current!.scrollTop, // Adding scrolled height
        (e.target as HTMLElement).clientHeight,
        (e.target as HTMLElement).children
      );

      // Input in front (counted in)
      if (inputLineIndex === lineIndex && targetIndex > inputIndex)
        targetIndex -= 1;

      setInputIndex(targetIndex);
      setInputLineIndex(lineIndex);
    } else {
      // Set input to end
      setInputIndex(lines[lines.length - 1].length);
      setInputLineIndex(lines.length - 1);
    }

    setTimeout(() => inputRef.current?.focus(), 0);
  }

  // Handles user input in editor
  function handleInput(e: React.FormEvent<HTMLDivElement>) {
    if (selectedBlocks.length !== 0) setSelectedBlocks([]); // Removes block selection when writing
    setInputText(e.currentTarget.textContent || "");
  }

  // Dnd started
  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    const activeId = active.id;

    const foundBlock = blocks.find((block) => block.index === activeId);

    if (foundBlock) {
      setActiveBlock(foundBlock);
    }
  }

  // DnD ended (dropped)
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeId = active.id;
    const overId = String(over.id);

    let sourceLineIndex = -1;
    let targetLineIndex = -1;
    let activeBlock: BlockType | undefined;

    // Find source line and active block
    lines.forEach((line, lineIndex) => {
      const found = line.find((block) => block.index === activeId);
      if (found) {
        sourceLineIndex = lineIndex;
        activeBlock = found;
      }
    });

    const isMultipleDrag =
      selectedBlocks.some((block) => block.index === activeId) &&
      selectedBlocks.length !== 0;

    let targetIndex;
    let newBlocks = [...blocks];

    // Filter blocks
    if (isMultipleDrag) {
      newBlocks = newBlocks.filter(
        (block) =>
          !selectedBlocks.some(
            (selectedBlock) =>
              selectedBlock.index === block.index &&
              selectedBlock.content !== "\n"
          )
      );
    } else {
      newBlocks = newBlocks.filter((block) => block.index !== activeId);
    }

    // Is dropped on line, or block
    if (overId.startsWith("line-")) {
      targetLineIndex = parseInt(overId.replace("line-", ""), 10);

      // If not found
      if (sourceLineIndex === -1 || targetLineIndex === -1 || !activeBlock)
        return;

      // Find insert index -> count \n in blocks, if empty, put it there, if not, put it on end
      targetIndex = findDragOnLineIndex(newBlocks, targetLineIndex);
    } else {
      // Find line where target is
      lines.forEach((line, lineIndex) => {
        const isInTarget = line.some(
          (block) => block.index === parseInt(overId)
        );
        if (isInTarget) targetLineIndex = lineIndex;
      });

      // If not found
      if (sourceLineIndex === -1 || targetLineIndex === -1 || !activeBlock)
        return;

      // Find new index for block
      targetIndex = newBlocks.findIndex(
        (block) => block.index === parseInt(overId)
      );

      if (
        blocks.findIndex((block) => block.index === activeId) <
        blocks.findIndex((block) => block.index === parseInt(overId))
      ) {
        targetIndex += 1;
      }
    }

    // Set new blocks
    if (isMultipleDrag) {
      newBlocks.splice(targetIndex, 0, ...selectedBlocks);
    } else {
      newBlocks.splice(targetIndex, 0, activeBlock);
    }
    setBlocks(newBlocks);
  }

  // Finds index for dropping block when DnD
  function findDragOnLineIndex(blocks: BlockType[], targetLineIndex: number) {
    // Find insert index -> count \n in blocks, if empty, put it there, if not, put it on end
    let targetIndex = -1;
    let newLines = 0;
    let i = 0;

    // First line
    if (targetLineIndex !== 0) {
      while (i < blocks.length) {
        // Correct line
        if (newLines === targetLineIndex) {
          if (blocks[i].content === "\n") {
            targetIndex = i;
            break;
          }
        }

        // New line
        if (blocks[i].content === "\n") {
          newLines++;
          i++;
          continue;
        }

        i++;
      }
    } else {
      targetIndex = lines[0].length;
    }

    // If it was on last line (no \n on end)
    if (i === blocks.length) targetIndex = i;

    return targetIndex;
  }

  // DnD canceled
  function handleDragCancel() {
    setActiveBlock(null);
  }

  // When clicked on a prefab block, the block gets added to the place of input
  function handleClickPrefab(content: string, wordType: number) {
    const insertIndex = countInsertIndex();
    setBlocks((prevBlocks) => [
      ...prevBlocks.slice(0, insertIndex),
      wordType !== -2 ? makeBlock(content, wordType) : makeBlock(content),
      ...prevBlocks.slice(insertIndex),
    ]);

    setInputIndex(inputIndex + 1);
  }

  // Rendering function
  function renderLine(line: BlockType[], lineIndex: number) {
    const blockIds = line.map((block) => block.index);

    return (
      <SortableContext
        key={lineIndex}
        items={blockIds}
        strategy={horizontalListSortingStrategy}
      >
        <Line
          key={lineIndex}
          lineIndex={lineIndex}
          baseLineHeight={baseLineHeight.current}
        >
          {line.map((block, wordIndex) => {
            const isInputHere =
              inputLineIndex === lineIndex && inputIndex === wordIndex;

            return (
              <>
                {isInputHere && (
                  <InputBox
                    inputRef={inputRef}
                    onInput={handleInput}
                    onKeyDown={handleKeyDown}
                  />
                )}

                <SortableBlock
                  key={block.index}
                  block={block}
                  indexOnLine={wordIndex}
                  lineIndex={lineIndex}
                  isSelected={selectedBlocks.some(
                    (b) => b.index === block.index
                  )}
                  customization={
                    customization.blockStyles[typeKeyMap[block.wordType]]
                  }
                  // showShadows={customization.boxShadow}
                />
              </>
            );
          })}

          {/* Input on end */}
          {inputLineIndex === lineIndex && inputIndex === line.length && (
            <InputBox
              inputRef={inputRef}
              onInput={handleInput}
              onKeyDown={handleKeyDown}
            />
          )}
        </Line>
      </SortableContext>
    );
  }

  return (
    <>
      {prefabVisible && <PrefabSection onClick={handleClickPrefab} />}

      <div
        className="blockEditor-container"
        ref={editorRef}
        onPaste={(e) => handlePaste(e)}
        onCopy={handleCopy}
        onMouseDown={(e) => handleEditorClick(e)}
        style={{
          backgroundColor: customization.backgroundColor,
          fontFamily: customization.fontFamily,
        }}
      >
        <DndContext
          onDragStart={(e) => handleDragStart(e)}
          onDragEnd={(e) => handleDragEnd(e)}
          onDragCancel={handleDragCancel}
          collisionDetection={(args) => {
            const collisions = rectIntersection(args);
            if (collisions.length === 0) {
              return pointerWithin(args);
            }
            return collisions;
          }}
        >
          <DragOverlay>
            {activeBlock && (
              <SortableBlock
                block={activeBlock}
                lineIndex={2}
                indexOnLine={-1}
                isSelected={false}
                customization={
                  customization.blockStyles[typeKeyMap[activeBlock.wordType]]
                }
                // showShadows={customization.boxShadow}
              />
            )}
          </DragOverlay>
          {lines.map((line, lineIndex) => renderLine(line, lineIndex))}
        </DndContext>
      </div>
    </>
  );
}
