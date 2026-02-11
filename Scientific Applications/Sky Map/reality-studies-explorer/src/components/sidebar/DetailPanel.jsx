import { useMemo } from 'react';
import nodes from '../../data/nodes';
import { flowEdges } from '../../data/edges';
import { copyShareLink } from '../../utils/sharing';
import { trackEvent, Events } from '../../utils/analytics';

const REGION_COLORS = {
  frame: '#4A6FA5',
  gradient: '#6B8F71',
  vector: '#C4775B',
  cross: '#8B7EC8',
};

const REGION_LABELS = {
  frame: 'Frame — Ethos',
  gradient: 'Gradient — Logos',
  vector: 'Vector — Pathos',
  cross: 'Cross-cutting',
};

export default function DetailPanel({ nodeId, onClose, onNavigate }) {
  const node = useMemo(() => nodes.find((n) => n.id === nodeId), [nodeId]);

  const connections = useMemo(() => {
    if (!nodeId) return [];
    return flowEdges
      .filter((e) => e.source === nodeId || e.target === nodeId)
      .map((e) => {
        const connectedId = e.source === nodeId ? e.target : e.source;
        return nodes.find((n) => n.id === connectedId);
      })
      .filter(Boolean);
  }, [nodeId]);

  if (!node) return null;

  const color = REGION_COLORS[node.region] || '#8B949E';

  const handleShare = async () => {
    const ok = await copyShareLink(nodeId);
    trackEvent(Events.NODE_SHARE, { nodeId });
    if (ok) {
      // Brief visual feedback would go here
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        width: 380,
        maxWidth: '90vw',
        height: '100%',
        background: '#161B22',
        borderLeft: '1px solid #30363D',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        animation: 'slideIn 0.25s ease-out',
        boxShadow: '-8px 0 32px rgba(0,0,0,0.5)',
      }}
    >
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @media (max-width: 640px) {
          .detail-panel-inner {
            position: fixed !important;
            top: auto !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            width: 100% !important;
            height: 60vh !important;
            border-left: none !important;
            border-top: 1px solid #30363D !important;
            border-radius: 16px 16px 0 0 !important;
          }
        }
      `}</style>

      {/* Header */}
      <div
        style={{
          padding: '20px 20px 16px',
          borderBottom: '1px solid #30363D',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 12,
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: color,
              }}
            />
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>{node.label}</h2>
          </div>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: color,
              background: `${color}18`,
              padding: '3px 10px',
              borderRadius: 4,
            }}
          >
            {REGION_LABELS[node.region]}
          </span>
        </div>
        <button
          onClick={onClose}
          aria-label="Close detail panel"
          style={{
            background: 'none',
            border: 'none',
            color: '#8B949E',
            fontSize: 20,
            cursor: 'pointer',
            padding: 4,
            lineHeight: 1,
          }}
        >
          ✕
        </button>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
        <p
          style={{
            fontSize: 16,
            fontWeight: 500,
            color: '#E6EDF3',
            marginBottom: 12,
            fontStyle: 'italic',
          }}
        >
          {node.oneLiner}
        </p>
        <p
          style={{
            fontSize: 14,
            lineHeight: 1.7,
            color: '#8B949E',
            marginBottom: 24,
          }}
        >
          {node.description}
        </p>

        {/* Connections */}
        {connections.length > 0 && (
          <div>
            <h3
              style={{
                fontSize: 12,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: '#6E7681',
                marginBottom: 10,
              }}
            >
              Connected Ideas
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {connections.map((conn) => (
                <button
                  key={conn.id}
                  onClick={() => onNavigate(conn.id)}
                  style={{
                    background: '#1C2128',
                    border: '1px solid #30363D',
                    borderRadius: 8,
                    padding: '10px 14px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#252B35')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '#1C2128')}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: REGION_COLORS[conn.region] || '#8B949E',
                      flexShrink: 0,
                    }}
                  />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#E6EDF3' }}>
                      {conn.label}
                    </div>
                    <div style={{ fontSize: 11, color: '#8B949E' }}>
                      {conn.oneLiner}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: '14px 20px',
          borderTop: '1px solid #30363D',
        }}
      >
        <button
          onClick={handleShare}
          style={{
            width: '100%',
            padding: '10px 16px',
            background: `${color}20`,
            border: `1px solid ${color}40`,
            borderRadius: 8,
            color: color,
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = `${color}30`)}
          onMouseLeave={(e) => (e.currentTarget.style.background = `${color}20`)}
        >
          Copy Share Link
        </button>
      </div>
    </div>
  );
}
