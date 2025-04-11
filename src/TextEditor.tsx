import { useRef, useState, useEffect } from "react";
import "./TextEditor.css"

export default function TextEditor({ blocks }){
    const [text, setText] = useState(convertToText(blocks));
    const editableRef = useRef<HTMLDivElement>(null);

    // On first render -> transform BLOCKS to TEXT
    // Has to be here, because otherwise, when you start writing, it gets deleted (empty ref)
    useEffect(() => {
        if (editableRef.current) {
            editableRef.current.innerText = convertToText(blocks);
        }
      }, []);

    function handleInput(){
        if (editableRef.current) {
            const content = editableRef.current.innerText;
            setText(content);
        }
    }

    function convertToText(blockArray){
        return blockArray.join(" ")
    }

    const highlightWords = (text: string) => {
        const words = text.split(/(\s+)/); // rozdělí na slova + mezery
        return words
          .map((word) =>
            word.trim() !== ""
              ? `<span class="word">${word}</span>`
              : word
          )
          .join("");
    };

    return (
        <>
        <div
            className="textEditor-container"
        >
            <div
                className="highlighted-layer"
                dangerouslySetInnerHTML={{ __html: highlightWords(text) + "<br />" }}
                />
            <div
                className="editor-layer"
                contentEditable
                onInput={handleInput}
                ref={editableRef}
            >
            </div>
        </div>
        </>
    );
}