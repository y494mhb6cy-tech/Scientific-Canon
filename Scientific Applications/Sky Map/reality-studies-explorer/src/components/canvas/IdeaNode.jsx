import { memo } from 'react';
import { Handle, Position, useStore } from '@xyflow/react';

const REGION_COLORS = {
  frame: '#4A6FA5',
  gradient: '#6B8F71',
  vector: '#C4775B',
  cross: '#8B7EC8',
};

const REGION_LABELS = {
  frame: 'Frame',
  gradient: 'Gradient',
  vector: 'Vector',
  cross: 'Cross-cutting',
};

const zoomSelector = (state) => state.transform[2];

function IdeaNode({ data, selected }) {
  const zoom = useStore(zoomSelector);
  const color = REGION_COLORS[data.region] || '#8B949E';

  // Level 1: zoomed way out — dot + label
  if (zoom < 0.5) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
          cursor: 'pointer',
        }}
      >
        <div
          style={{
            width: 16,
            height: 16,
            borderRadius: '50%',
            background: color,
            boxShadow: selected ? `0 0 0 3px ${color}44` : 'none',
          }}
        />
        <span
          style={{
            fontSize: 11,
            color: '#8B949E',
            whiteSpace: 'nowrap',
            fontWeight: 500,
          }}
        >
          {data.label}
        </span>
        <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
        <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
      </div>
    );
  }

  // Level 2: medium zoom — card with title + one-liner
  if (zoom <= 1.5) {
    return (
      <div
        style={{
          background: '#161B22',
          border: `1.5px solid ${selected ? color : '#30363D'}`,
          borderRadius: 10,
          padding: '12px 16px',
          minWidth: 160,
          maxWidth: 220,
          cursor: 'pointer',
          boxShadow: selected
            ? `0 0 0 2px ${color}33, 0 4px 24px rgba(0,0,0,0.4)`
            : '0 2px 8px rgba(0,0,0,0.3)',
          transition: 'border-color 0.2s, box-shadow 0.2s',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 6,
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: color,
              flexShrink: 0,
            }}
          />
          <span style={{ fontWeight: 600, fontSize: 14, color: '#E6EDF3' }}>
            {data.label}
          </span>
        </div>
        <p
          style={{
            fontSize: 12,
            color: '#8B949E',
            lineHeight: 1.4,
            margin: 0,
          }}
        >
          {data.oneLiner}
        </p>
        <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
        <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
      </div>
    );
  }

  // Level 3: zoomed in — full card
  return (
    <div
      style={{
        background: '#161B22',
        border: `1.5px solid ${selected ? color : '#30363D'}`,
        borderRadius: 12,
        padding: '16px 20px',
        minWidth: 200,
        maxWidth: 280,
        cursor: 'pointer',
        boxShadow: selected
          ? `0 0 0 2px ${color}33, 0 4px 24px rgba(0,0,0,0.4)`
          : '0 2px 12px rgba(0,0,0,0.3)',
        transition: 'border-color 0.2s, box-shadow 0.2s',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 8,
        }}
      >
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: color,
            flexShrink: 0,
          }}
        />
        <span style={{ fontWeight: 600, fontSize: 15, color: '#E6EDF3' }}>
          {data.label}
        </span>
      </div>
      <span
        style={{
          display: 'inline-block',
          fontSize: 10,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: color,
          background: `${color}18`,
          padding: '2px 8px',
          borderRadius: 4,
          marginBottom: 8,
        }}
      >
        {REGION_LABELS[data.region]}
      </span>
      <p
        style={{
          fontSize: 12,
          color: '#8B949E',
          lineHeight: 1.5,
          margin: '0 0 10px',
        }}
      >
        {data.description?.slice(0, 150)}
        {data.description?.length > 150 ? '...' : ''}
      </p>
      <span
        style={{
          fontSize: 11,
          color: color,
          fontWeight: 500,
          cursor: 'pointer',
        }}
      >
        Read more →
      </span>
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
    </div>
  );
}

export default memo(IdeaNode);
