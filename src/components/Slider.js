export default function Slider({
  id,
  label,
  value,
  onChange,
  min = 0,
  max = 100
}) {
  return (
    <>
      <label htmlFor={id}>
        {label}
        <span className="slider-value"><samp>{value}</samp></span>
      </label>
      <div className="slider-container">
        <input
          type="range"
          id={id}
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
        />
      </div>
    </>
  );
}
