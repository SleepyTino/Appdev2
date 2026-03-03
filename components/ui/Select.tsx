interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export default function Select({
  label,
  error,
  options,
  className = "",
  ...props
}: SelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-300 mb-2">
          {label}
        </label>
      )}
      <select
        className={`
          w-full px-4 py-3.5 bg-slate-900/60 border border-slate-700/50
          rounded-xl text-white text-sm
          transition-all duration-200 cursor-pointer appearance-none
          focus:border-brand-400 focus:bg-slate-900/90 focus:ring-1 focus:ring-brand-400/20
          outline-none
          bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')]
          bg-[length:16px] bg-[right_16px_center] bg-no-repeat
          ${error ? "border-red-500" : ""}
          ${className}
        `}
        {...props}
      >
        {options.map((opt) => (
          <option
            key={opt.value}
            value={opt.value}
            className="bg-slate-900 text-white"
          >
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
    </div>
  );
}
