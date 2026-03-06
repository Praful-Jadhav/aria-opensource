import React from 'react';

interface TableColumn<T> {
  key: keyof T | string;
  header: React.ReactNode;
  render: (row: T) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  emptyText?: string;
}

export function Table<T extends { id: string }>({ data, columns, emptyText = 'No data available' }: TableProps<T>) {
  return (
    <div style={{ width: '100%', overflowX: 'auto', border: '1px solid var(--border, #E5E7EB)', borderRadius: 'var(--radius-md, 8px)', background: 'var(--surface, #FFFFFF)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontFamily: 'var(--font)' }}>
        <thead>
          <tr style={{ background: '#F9FAFB', borderBottom: '1px solid var(--border, #E5E7EB)' }}>
            {columns.map((col, i) => (
              <th
                key={col.key as string}
                style={{
                  padding: '0.75rem 1rem',
                  fontSize: 'var(--size-xs, 11px)',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  color: 'var(--text-muted, #6B7280)',
                  letterSpacing: '0.05em',
                  width: col.width,
                  textAlign: col.align || 'left',
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted, #6B7280)', fontSize: 'var(--size-sm, 13px)' }}>
                {emptyText}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr key={row.id} style={{ borderBottom: '1px solid var(--border, #E5E7EB)', transition: 'background 0.15s' }}>
                {columns.map((col) => (
                  <td
                    key={col.key as string}
                    style={{
                      padding: '0.875rem 1rem',
                      fontSize: 'var(--size-sm, 13px)',
                      color: 'var(--text, #111827)',
                      textAlign: col.align || 'left',
                    }}
                  >
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
