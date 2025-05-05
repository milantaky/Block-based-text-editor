export default function InputBox({
  inputRef,
  onInput,
  onKeyDown,
}: {
  inputRef: React.RefObject<HTMLDivElement>;
  onInput: (e: React.FormEvent<HTMLDivElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
}) {
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
