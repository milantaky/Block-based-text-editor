export default function InputBox({ inputRef, onInput, onKeyDown}) {
  return (
    <div
      ref={inputRef}
      className="input-box"
      contentEditable
      suppressContentEditableWarning
      onInput={onInput}
      onKeyDown={onKeyDown}
    />
  );
}
