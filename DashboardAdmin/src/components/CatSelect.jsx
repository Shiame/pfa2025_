import { categories } from '../constants/categories'; 
export default function CatSelect({ value, onChange }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="bg-white border border-gray-300 rounded-full px-4 py-2 text-sm shadow-sm
                 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {categories.map(c => (
        <option key={c} value={c}>
          {c === 'ALL' ? 'Toutes les catégories' : c}
        </option>
      ))}
    </select>
  );
}
