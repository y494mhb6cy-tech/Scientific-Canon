import { memo } from 'react';
import { useStore } from '@xyflow/react';
import regions from '../../data/regions';

const transformSelector = (state) => state.transform;

function RegionBackground() {
  const transform = useStore(transformSelector);
  const [tx, ty, zoom] = transform;

  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      {regions.map((region) => {
        const x = region.x * zoom + tx;
        const y = region.y * zoom + ty;
        const w = region.width * zoom;
        const h = region.height * zoom;

        return (
          <g key={region.id}>
            <rect
              x={x}
              y={y}
              width={w}
              height={h}
              rx={16 * zoom}
              fill={region.bgColor}
              stroke={region.borderColor}
              strokeWidth={1}
            />
            {zoom > 0.3 && (
              <text
                x={x + 20 * zoom}
                y={y + 36 * zoom}
                fill={region.color}
                fontSize={Math.max(14, 24 * zoom)}
                fontWeight="700"
                opacity={0.5}
                fontFamily="var(--font)"
              >
                {region.label}
              </text>
            )}
            {zoom > 0.5 && (
              <text
                x={x + 20 * zoom}
                y={y + 56 * zoom}
                fill={region.color}
                fontSize={Math.max(10, 14 * zoom)}
                opacity={0.35}
                fontFamily="var(--font)"
              >
                {region.subtitle}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export default memo(RegionBackground);
