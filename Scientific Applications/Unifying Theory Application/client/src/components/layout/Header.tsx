import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ModeContext } from '../../context/ModeContext';
import { useSession } from '../../hooks/useSession';
import type { ModeType } from '../../api/client';

const modes: { key: ModeType; label: string; path: string }[] = [
  { key: 'guided', label: 'Guided', path: '/guided' },
  { key: 'expert', label: 'Expert', path: '/expert' },
  { key: 'audit', label: 'Audit', path: '/audit' },
];

export default function Header() {
  const { currentMode, setMode } = useContext(ModeContext);
  const { createNewSession } = useSession();
  const navigate = useNavigate();

  const handleModeSwitch = async (mode: ModeType, path: string) => {
    setMode(mode);
    await createNewSession(mode);
    navigate(path);
  };

  return (
    <header style={styles.header}>
      <div style={styles.brand}>
        <div style={styles.logoMark}>
          <span style={{ color: 'var(--color-frame)' }}>F</span>
          <span style={{ color: 'var(--color-gradient)' }}>G</span>
          <span style={{ color: 'var(--color-vector)' }}>V</span>
        </div>
        <h1 style={styles.title}>Unifying Theory Engine</h1>
      </div>
      <nav style={styles.nav}>
        {modes.map((m) => (
          <button
            key={m.key}
            onClick={() => handleModeSwitch(m.key, m.path)}
            style={{
              ...styles.tab,
              ...(currentMode === m.key ? styles.tabActive : {}),
            }}
          >
            {m.label}
          </button>
        ))}
      </nav>
    </header>
  );
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 var(--sp-6)',
    height: '60px',
    background: 'var(--color-surface)',
    borderBottom: '1px solid var(--color-border)',
    flexShrink: 0,
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--sp-3)',
  },
  logoMark: {
    display: 'flex',
    gap: '2px',
    fontWeight: 800,
    fontSize: 'var(--fs-lg)',
    fontFamily: 'monospace',
  },
  title: {
    fontSize: 'var(--fs-lg)',
    fontWeight: 600,
    color: 'var(--color-text)',
  },
  nav: {
    display: 'flex',
    gap: 'var(--sp-1)',
  },
  tab: {
    padding: 'var(--sp-2) var(--sp-4)',
    background: 'transparent',
    border: '1px solid transparent',
    borderRadius: 'var(--radius-md)',
    color: 'var(--color-text-muted)',
    fontSize: 'var(--fs-sm)',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 150ms ease',
  },
  tabActive: {
    background: 'var(--color-bg)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text)',
  },
};
