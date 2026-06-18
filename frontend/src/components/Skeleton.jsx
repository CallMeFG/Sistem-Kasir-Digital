export function SkeletonLine({ width = '100%', height = '16px', style = {} }) {
  return <div className="skeleton" style={{ width, height, borderRadius: 8, ...style }} />;
}

export function SkeletonCard() {
  return (
    <div className="card card-p" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <SkeletonLine width="60px" height="22px" />
        <SkeletonLine width="70px" height="22px" />
      </div>
      <SkeletonLine width="75%" height="20px" />
      <SkeletonLine width="50%" height="24px" />
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <SkeletonLine height="34px" />
        <SkeletonLine height="34px" />
      </div>
    </div>
  );
}

export function SkeletonStatCard() {
  return (
    <div className="stat-card">
      <SkeletonLine width="44px" height="44px" style={{ borderRadius: 12, marginBottom: 14 }} />
      <SkeletonLine width="60%" height="12px" style={{ marginBottom: 8 }} />
      <SkeletonLine width="80%" height="28px" />
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i}><SkeletonLine width="80px" height="12px" /></th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r}>
              {Array.from({ length: cols }).map((_, c) => (
                <td key={c}><SkeletonLine width={c === 0 ? '120px' : '80px'} height="14px" /></td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="skeleton" style={{ width: '100%', height: 260, borderRadius: 12 }} />
  );
}
