import { useState, useRef, useEffect } from "react";

type BlockProps = {
  index: number;
  content: string;
};

export default function BlockEditor({ text, blocksRef }) {
  const [blocks, setBlocks] = useState<string[]>([]);
  const [inputText, setInputText] = useState("");
  const [inputIndex, setInputIndex] = useState(0); // This index says before which block the input is
  const [inputLineIndex, setInputLineIndex] = useState(0); // Which line the input is on (0 = first line)
  const inputRef = useRef<HTMLDivElement>(null);
  const changeBlockRef = useRef(false);
  const lines = splitLines(blocks);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.textContent = inputText;

      // Sets caret on the end when pressing backspace on block (editing)
      if (changeBlockRef) {
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(inputRef.current!);
        range.collapse(false);
        sel!.removeAllRanges();
        sel!.addRange(range);

        //! tady zmenit changleblockref zpatky????
      }
    }
  }, [inputIndex, inputLineIndex, inputText]);

  useEffect(() => {
    blocksRef.current = blocks;
  }, [blocks]);

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
        // e.preventDefault();
        if (inputText === "" && blocks.length > 0) {
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
        if (inputText === "" && inputLineIndex > 0) {
          setInputLineIndex(inputLineIndex - 1);

          // If lower line is longer, set input index to end of upper line
          if (inputIndex > lines[inputLineIndex - 1].length) {
            setInputIndex(lines[inputLineIndex - 1].length);
          }
        }
        break;

      case "ArrowDown":
        e.preventDefault();
        if (inputText === "" && inputLineIndex < lines.length - 1) {
          setInputLineIndex(inputLineIndex + 1);

          // If there is line below
          // If upper line is longer, set input index to end of lower line
          if (inputIndex > lines[inputLineIndex + 1].length) {
            setInputIndex(lines[inputLineIndex + 1].length);
          }
        }
        break;

      case "Enter":
        if (inputText !== "") {
          setBlocks([...blocks, inputText.trim(), "\n"]);
          setInputText("");
        } else {
          setBlocks([...blocks, "\n"]);
        }
        setInputLineIndex(inputLineIndex + 1);
        setInputIndex(0);
        break;

      default:
        break;
    }
  }

  function splitLines(blocks: string[]): string[][] {
    const lines: string[][] = [[]];
    let index = 0;

    blocks.forEach((block) => {
      // If \n add line, else add to previous line
      if (block === "\n") {
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

  // Input component
  // - If editor in text mode, apply no styling (class text-input)
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

  // Block component
  // - If editor in text mode, apply no styling (class text)
  function Block({
    index,
    content,
    lineIndex,
  }: BlockProps & { lineIndex: number }) {
    return (
      <div
        key={index}
        // className="block"
        className="block"
        contentEditable
        suppressContentEditableWarning
        onClick={(e) => handleClick(e, lineIndex, index)}
      >
        {content}
      </div>
    );
  }

  return lines.map((line, lineIndex) => {
    // No Blocks
    if (lines.length === 1 && line.length === 0) {
      return (
        <div
          key={lineIndex}
          className="line"
          onClick={(e) => handleClick(e, lineIndex)}
        >
          <InputBox />
        </div>
      );
    } else {
      // Empty line
      if (
        line.length === 0 &&
        inputIndex === 0 &&
        inputLineIndex === lineIndex
      ) {
        return (
          <div
            key={lineIndex}
            className="line"
            onClick={(e) => handleClick(e, lineIndex)}
          >
            <InputBox />
          </div>
        );
      }

      // Lines and blocks
      return (
        <div
          key={lineIndex}
          className="line"
          onClick={(e) => handleClick(e, lineIndex)}
        >
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
        </div>
      );
    }
  });
}
