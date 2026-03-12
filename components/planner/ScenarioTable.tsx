type ScenarioRow = Record<string, string | number | undefined>;

export function ScenarioTable({ scenarios }: { scenarios: ScenarioRow[] }) {
  if (scenarios.length === 0) return null;

  const keys = Object.keys(scenarios[0] ?? {});

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-border bg-surface-elevated">
          <tr>
            {keys.map((k) => (
              <th key={k} className="px-4 py-2 font-medium text-text-secondary">
                {k}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {scenarios.map((row, i) => (
            <tr key={i} className="border-b border-border last:border-0">
              {keys.map((k) => (
                <td key={k} className="px-4 py-2 font-mono text-text-primary">
                  {row[k] ?? "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
