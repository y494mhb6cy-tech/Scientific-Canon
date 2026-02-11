import { trackEvent, Events } from '../../utils/analytics';

const STEPS = [
  {
    title: 'Pan the canvas',
    body: 'Click and drag anywhere to move around the idea space.',
    position: { top: 80, left: '50%', transform: 'translateX(-50%)' },
  },
  {
    title: 'Zoom in & out',
    body: 'Use scroll wheel or pinch to zoom. Ideas reveal more detail as you get closer.',
    position: { top: 80, left: '50%', transform: 'translateX(-50%)' },
  },
  {
    title: 'Click an idea',
    body: 'Tap any node to open its detail panel. Follow connections to related concepts.',
    position: { top: 80, left: '50%', transform: 'translateX(-50%)' },
  },
  {
    title: 'Share what you find',
    body: 'Every idea has a shareable link. Copy it from the detail panel to share with anyone.',
    position: { top: 80, left: '50%', transform: 'translateX(-50%)' },
  },
];

export default function GuidedTour({ step, onNext, onSkip }) {
  if (step < 0 || step >= STEPS.length) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  if (step === 0) {
    trackEvent(Events.TOUR_START);
  }
  trackEvent(Events.TOUR_STEP, { step });

  const handleNext = () => {
    if (isLast) {
      trackEvent(Events.TOUR_COMPLETE);
    }
    onNext();
  };

  const handleSkip = () => {
    trackEvent(Events.TOUR_SKIP, { step });
    onSkip();
  };

  return (
    <div
      style={{
        position: 'fixed',
        ...current.position,
        zIndex: 90,
        background: '#1C2128',
        border: '1px solid #30363D',
        borderRadius: 12,
        padding: '18px 22px',
        maxWidth: 320,
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        animation: 'fadeUp 0.3s ease-out',
      }}
      role="dialog"
      aria-label={`Tour step ${step + 1} of ${STEPS.length}`}
    >
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px) translateX(-50%); }
          to { opacity: 1; transform: translateY(0) translateX(-50%); }
        }
      `}</style>

      {/* Step indicator */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
        {STEPS.map((_, i) => (
          <div
            key={i}
            style={{
              width: i === step ? 20 : 8,
              height: 4,
              borderRadius: 2,
              background: i === step ? '#6B8F71' : '#30363D',
              transition: 'all 0.2s',
            }}
          />
        ))}
      </div>

      <h3 style={{ fontSize: 15, fontWeight: 700, color: '#E6EDF3', marginBottom: 6 }}>
        {current.title}
      </h3>
      <p style={{ fontSize: 13, color: '#8B949E', lineHeight: 1.5, marginBottom: 16 }}>
        {current.body}
      </p>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          onClick={handleSkip}
          style={{
            background: 'none',
            border: 'none',
            color: '#6E7681',
            fontSize: 12,
            cursor: 'pointer',
            padding: '4px 0',
          }}
        >
          Skip tour
        </button>
        <button
          onClick={handleNext}
          style={{
            background: '#6B8F71',
            border: 'none',
            borderRadius: 8,
            color: '#E6EDF3',
            fontSize: 13,
            fontWeight: 600,
            padding: '8px 18px',
            cursor: 'pointer',
          }}
        >
          {isLast ? 'Done' : 'Next'}
        </button>
      </div>
    </div>
  );
}
