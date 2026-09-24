"use client";

export default function AutoSubmitSelect({
  name,
  defaultValue,
  options,
  className = "input min-h-10 py-2",
}: {
  name: string;
  defaultValue: string;
  options: { value: string; label: string }[];
  className?: string;
}) {
  return (
    <select name={name} defaultValue={defaultValue} className={className} onChange={(e) => e.currentTarget.form?.requestSubmit()}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
