import type { ReactNode } from 'react';

interface MainPanelProps {
  children: ReactNode;
}

export default function MainPanel({ children }: MainPanelProps) {
  return <div style={styles.panel}>{children}</div>;
}

const styles: Record<string, React.CSSProperties> = {
  panel: {
    flex: 1,
    padding: 'var(--sp-6)',
    overflowY: 'auto' as const,
    maxHeight: 'calc(100vh - 60px)',
  },
};
