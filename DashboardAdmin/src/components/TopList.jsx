// src/components/TopList.jsx
export default function TopList({ communes = [] }) {
  if (communes.length === 0) {
    return (
      <p className="text-gray-500 text-sm">
        Aucune donnée disponible pour cette période
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">
              Commune
            </th>
            <th className="px-4 py-2 text-right font-medium text-gray-500 uppercase tracking-wider">
              Plaintes
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {communes.map((c, idx) => (
            <tr key={c.commune} className="hover:bg-gray-50">
              <td className="px-4 py-2 font-medium whitespace-nowrap">
                {idx + 1}. {c.commune}
              </td>
              <td className="px-4 py-2 text-right whitespace-nowrap">
                {c.totalPlaintes}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
