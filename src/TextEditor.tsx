import { useRef, useState } from "react";
import "./TextEditor.css"

export default function TextEditor(){
    const [text, setText] = useState("");
    const editableRef = useRef<HTMLDivElement>(null);

    function handleInput(){
        if (editableRef.current) {
            const content = editableRef.current.innerText;
            setText(content);
        }
        console.log(text)
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
        </>
    );
}