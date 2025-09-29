export default function TextArea({
  id,
  label,
  value,
  onChange,
  rows = 4,
  placeholder,
  ...otherProps
}) {
  return (
    <>
      <label htmlFor={id}>
        {label}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        style={{ resize: "none" }}
        {...otherProps}
      />
    </>
  );
}
