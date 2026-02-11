import { useEffect, useCallback } from 'react';
import { useReactFlow } from '@xyflow/react';

function parseHash() {
  const hash = window.location.hash.slice(1);
  const params = new URLSearchParams(hash);
  return {
    nodeId: params.get('node') || null,
    zoom: params.get('z') ? parseFloat(params.get('z')) : null,
  };
}

export default function useCanvasNavigation(onSelectNode) {
  const { setCenter, getNode } = useReactFlow();

  // On mount, read hash and navigate
  useEffect(() => {
    const { nodeId, zoom } = parseHash();
    if (nodeId) {
      // Small delay to let React Flow initialize
      const timer = setTimeout(() => {
        const node = getNode(nodeId);
        if (node) {
          setCenter(
            node.position.x + 100,
            node.position.y + 40,
            { zoom: zoom || 1.2, duration: 600 }
          );
          onSelectNode(nodeId);
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const navigateToNode = useCallback(
    (nodeId, zoom = 1.2) => {
      const node = getNode(nodeId);
      if (node) {
        setCenter(
          node.position.x + 100,
          node.position.y + 40,
          { zoom, duration: 600 }
        );
        window.location.hash = `node=${nodeId}&z=${zoom}`;
      }
    },
    [getNode, setCenter]
  );

  return { navigateToNode };
}
