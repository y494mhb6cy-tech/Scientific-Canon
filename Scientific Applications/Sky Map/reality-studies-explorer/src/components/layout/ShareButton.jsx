import { useState } from 'react';
import { copyShareLink } from '../../utils/sharing';
import { trackEvent, Events } from '../../utils/analytics';

export default function ShareButton({ nodeId }) {
  const [copied, setCopied] = useState(false);

  const handleClick = async () => {
    const ok = await copyShareLink(nodeId);
    trackEvent(Events.NODE_SHARE, { nodeId });
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!nodeId) return null;

  return (
    <button
      onClick={handleClick}
      style={{
        padding: '6px 14px',
        fontSize: 12,
        fontWeight: 600,
        background: copied ? '#6B8F71' : '#1C2128',
        border: '1px solid #30363D',
        borderRadius: 6,
        color: copied ? '#E6EDF3' : '#8B949E',
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
    >
      {copied ? 'Copied!' : 'Share'}
    </button>
  );
}
