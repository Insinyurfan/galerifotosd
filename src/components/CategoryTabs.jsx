import { CATEGORIES } from "../constants/media.js";

export default function CategoryTabs({ activeCategory, onChange }) {
  return (
    <div className="flex overflow-x-auto rounded-lg border border-blue-100 bg-white p-1 shadow-sm">
      {CATEGORIES.map((category) => (
        <button
          key={category}
          type="button"
          onClick={() => onChange(category)}
          className={`min-h-10 whitespace-nowrap rounded-md px-4 text-sm font-semibold transition ${
            activeCategory === category
              ? "bg-sapphire-700 text-white shadow-sm"
              : "text-slate-600 hover:bg-blue-50 hover:text-sapphire-700"
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
