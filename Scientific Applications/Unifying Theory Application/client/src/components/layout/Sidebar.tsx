import type { DomainPack } from '../../api/client';
import DomainSelector from '../domain/DomainSelector';

interface SidebarProps {
  domains: DomainPack[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  onCustomCreated: () => void;
  loading?: boolean;
}

export default function Sidebar({
  domains,
  selectedIds,
  onToggle,
  onCustomCreated,
  loading,
}: SidebarProps) {
  return (
    <aside style={styles.sidebar}>
      <div style={styles.header}>
        <h2 style={styles.title}>Domains</h2>
        <span style={styles.count}>{selectedIds.length} selected</span>
      </div>
      <div style={styles.content}>
        <DomainSelector
          domains={domains}
          selectedIds={selectedIds}
          onToggle={onToggle}
          onCustomCreated={onCustomCreated}
          loading={loading}
        />
      </div>
    </aside>
  );
}

const styles: Record<string, React.CSSProperties> = {
  sidebar: {
    width: '320px',
    minWidth: '320px',
    background: 'var(--color-surface)',
    borderRight: '1px solid var(--color-border)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 'var(--sp-4) var(--sp-4)',
    borderBottom: '1px solid var(--color-border)',
  },
  title: {
    fontSize: 'var(--fs-sm)',
    fontWeight: 600,
    color: 'var(--color-text)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  count: {
    fontSize: 'var(--fs-xs)',
    color: 'var(--color-text-muted)',
  },
  content: {
    flex: 1,
    overflowY: 'auto' as const,
    padding: 'var(--sp-3)',
  },
};
