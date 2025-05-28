import { useMemo, useState } from 'react';

export default function ResolutionTable({ rows }) {
  const communes = useMemo(
    () => [...new Set(rows.map(r => r.commune))],
    [rows]
  );
  const [sel, setSel] = useState(communes[0] || '');

  const filtered = rows.filter(r => r.commune === sel);

  return (
    <div className="bg-white shadow rounded-xl p-4">
      <h2 className="font-semibold mb-3">Taux de résolution (%)</h2>

      <select
        className="border rounded mb-2 p-1"
        value={sel}
        onChange={e => setSel(e.target.value)}
      >
        {communes.map(c => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-left">
            <th>Catégorie</th><th className="text-right">Taux</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(r => (
            <tr key={r.categorie}>
              <td>{r.categorie}</td>
              <td className="text-right">{r.tauxResolution.toFixed(1)} %</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
