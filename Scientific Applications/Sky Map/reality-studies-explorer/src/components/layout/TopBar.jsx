import { useState, useMemo, useRef, useEffect } from 'react';
import nodes from '../../data/nodes';
import logoSvg from '../../assets/logo.svg';
import { trackEvent, Events } from '../../utils/analytics';

export default function TopBar({ onSelectNode, onNavigate, onHelp }) {
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const inputRef = useRef(null);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return nodes.filter(
      (n) =>
        n.label.toLowerCase().includes(q) ||
        n.oneLiner.toLowerCase().includes(q) ||
        n.description.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [query]);

  useEffect(() => {
    const handleKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setShowResults(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const handleSelect = (id) => {
    setQuery('');
    setShowResults(false);
    onSelectNode(id);
    onNavigate(id);
    trackEvent(Events.SEARCH, { nodeId: id });
  };

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 56,
        background: 'rgba(22, 27, 34, 0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #30363D',
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        gap: 16,
        zIndex: 40,
      }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <img src={logoSvg} alt="Reality Studies" style={{ width: 28, height: 28 }} />
        <span style={{ fontWeight: 700, fontSize: 15, color: '#E6EDF3' }}>
          Reality Studies
        </span>
      </div>

      {/* Search */}
      <div style={{ flex: 1, maxWidth: 400, position: 'relative' }}>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => query && setShowResults(true)}
          onBlur={() => setTimeout(() => setShowResults(false), 200)}
          placeholder="Search ideas... ⌘K"
          aria-label="Search ideas"
          style={{
            width: '100%',
            padding: '8px 14px',
            background: '#0E1117',
            border: '1px solid #30363D',
            borderRadius: 8,
            color: '#E6EDF3',
            fontSize: 13,
            outline: 'none',
          }}
        />
        {showResults && results.length > 0 && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: 4,
              background: '#1C2128',
              border: '1px solid #30363D',
              borderRadius: 10,
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            }}
          >
            {results.map((n) => (
              <button
                key={n.id}
                onMouseDown={() => handleSelect(n.id)}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '10px 14px',
                  background: 'transparent',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  borderBottom: '1px solid #30363D22',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#252B35')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{ fontSize: 13, fontWeight: 600, color: '#E6EDF3' }}>
                  {n.label}
                </div>
                <div style={{ fontSize: 11, color: '#8B949E', marginTop: 2 }}>
                  {n.oneLiner}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Help button */}
      <button
        onClick={onHelp}
        aria-label="Help"
        style={{
          background: '#1C2128',
          border: '1px solid #30363D',
          borderRadius: 8,
          color: '#8B949E',
          fontSize: 13,
          fontWeight: 500,
          padding: '7px 14px',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        ? Help
      </button>
    </header>
  );
}
