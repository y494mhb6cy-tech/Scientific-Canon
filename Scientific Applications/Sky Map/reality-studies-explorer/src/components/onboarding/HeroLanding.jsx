import logoSvg from '../../assets/logo.svg';

export default function HeroLanding({ onDismiss }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(14, 17, 23, 0.92)',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      role="dialog"
      aria-label="Welcome to Reality Studies Explorer"
    >
      <div
        style={{
          textAlign: 'center',
          maxWidth: 520,
          padding: '0 24px',
          animation: 'fadeUp 0.5s ease-out',
        }}
      >
        <style>{`
          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>

        <img
          src={logoSvg}
          alt=""
          style={{
            width: 80,
            height: 80,
            marginBottom: 28,
            filter: 'drop-shadow(0 4px 24px rgba(107, 143, 113, 0.3))',
          }}
        />

        <h1
          style={{
            fontSize: 36,
            fontWeight: 800,
            color: '#E6EDF3',
            marginBottom: 12,
            lineHeight: 1.2,
          }}
        >
          Reality Studies Explorer
        </h1>

        <p
          style={{
            fontSize: 18,
            color: '#8B949E',
            lineHeight: 1.6,
            marginBottom: 8,
          }}
        >
          Navigate the Canon of Symmetry as a living map.
        </p>
        <p
          style={{
            fontSize: 15,
            color: '#6E7681',
            lineHeight: 1.6,
            marginBottom: 36,
          }}
        >
          Explore the relationships between Frame, Gradient, and Vector — the
          three dimensions that shape every perspective, pattern, and purpose.
        </p>

        <button
          onClick={onDismiss}
          style={{
            padding: '14px 36px',
            fontSize: 16,
            fontWeight: 600,
            background: 'linear-gradient(135deg, #4A6FA5, #6B8F71)',
            border: 'none',
            borderRadius: 12,
            color: '#E6EDF3',
            cursor: 'pointer',
            boxShadow: '0 4px 24px rgba(74, 111, 165, 0.3)',
            transition: 'transform 0.15s, box-shadow 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.03)';
            e.currentTarget.style.boxShadow = '0 6px 32px rgba(74, 111, 165, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 24px rgba(74, 111, 165, 0.3)';
          }}
        >
          Begin Exploring
        </button>

        <p style={{ fontSize: 12, color: '#6E7681', marginTop: 16 }}>
          Pan, zoom, and click to discover ideas
        </p>
      </div>
    </div>
  );
}
