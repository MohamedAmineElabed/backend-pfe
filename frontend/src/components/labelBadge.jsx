
const labelNames = {
  "non-conforme": "Non Conforme",
  "bronze": "Bronze",
  "argent": "Argent",
  "or": "Or",
  "excellence": "Excellence",
};

const labelColors = {
  "non-conforme": "bg-red-100 text-red-700",
  "bronze": "bg-yellow-100 text-yellow-700",
  "argent": "bg-gray-100 text-gray-700",
  "or": "bg-orange-100 text-orange-700",
  "excellence": "bg-green-100 text-green-700",
};

export default function LabelBadge({ label, size = "sm" }) {
  const baseClasses = "inline-flex items-center rounded-full font-medium";
  const sizeClasses = size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-sm";
  const colorClass = labelColors[label] || "bg-gray-100 text-gray-700";

  return (
    <span className={`${baseClasses} ${colorClass} ${sizeClasses}`}>
      {labelNames[label] || label}
    </span>
  );
}

export default function LabelBadge({ label, size = "sm" }) {
  const baseClasses = "inline-flex items-center rounded-full font-medium";
  const sizeClasses = size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-sm";
  const colorClass = getLabelColor(label);

  return (
    <span className={`${baseClasses} ${colorClass} ${sizeClasses}`}>
      {labelNames[label]}
    </span>
  );
}