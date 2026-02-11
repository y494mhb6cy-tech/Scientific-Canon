import { useState, useCallback } from 'react';

export default function useSelectedNode() {
  const [selectedNodeId, setSelectedNodeId] = useState(null);

  const selectNode = useCallback((id) => {
    setSelectedNodeId(id);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  return { selectedNodeId, selectNode, clearSelection };
}
