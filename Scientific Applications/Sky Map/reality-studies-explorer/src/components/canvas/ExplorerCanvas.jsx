import { useCallback, useEffect } from 'react';
import {
  ReactFlow,
  Controls,
  MiniMap,
  Background,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { flowNodes } from '../../data/nodes';
import { flowEdges } from '../../data/edges';
import IdeaNode from './IdeaNode';
import RegionBackground from './RegionBackground';
import useCanvasNavigation from '../../hooks/useCanvasNavigation';
import { trackEvent, Events } from '../../utils/analytics';

const nodeTypes = { idea: IdeaNode };

const MINIMAP_COLORS = {
  frame: '#4A6FA5',
  gradient: '#6B8F71',
  vector: '#C4775B',
  cross: '#8B7EC8',
};

export default function ExplorerCanvas({ onSelectNode, selectedNodeId, navigateRef }) {
  const [nodes, , onNodesChange] = useNodesState(
    flowNodes.map((n) => ({
      ...n,
      selected: n.id === selectedNodeId,
    }))
  );
  const [edges, , onEdgesChange] = useEdgesState(flowEdges);

  const { navigateToNode } = useCanvasNavigation(onSelectNode);

  // Expose navigateToNode to parent via ref
  useEffect(() => {
    if (navigateRef) {
      navigateRef.current = navigateToNode;
    }
  }, [navigateRef, navigateToNode]);

  const onNodeClick = useCallback(
    (_event, node) => {
      onSelectNode(node.id);
      navigateToNode(node.id);
      trackEvent(Events.NODE_CLICK, { nodeId: node.id });
    },
    [onSelectNode, navigateToNode]
  );

  const onPaneClick = useCallback(() => {
    onSelectNode(null);
    window.location.hash = '';
  }, [onSelectNode]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <ReactFlow
        nodes={nodes.map((n) => ({
          ...n,
          selected: n.id === selectedNodeId,
        }))}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3, maxZoom: 1 }}
        minZoom={0.15}
        maxZoom={3}
        defaultEdgeOptions={{
          type: 'default',
        }}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable
      >
        <RegionBackground />
        <Background color="#1C2128" gap={40} size={1} />
        <Controls showInteractive={false} />
        <MiniMap
          nodeColor={(node) => MINIMAP_COLORS[node.data?.region] || '#8B949E'}
          maskColor="rgba(14, 17, 23, 0.85)"
          pannable
          zoomable
        />
      </ReactFlow>
    </div>
  );
}
