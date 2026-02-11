import { useCallback, useRef } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import ExplorerCanvas from './components/canvas/ExplorerCanvas';
import DetailPanel from './components/sidebar/DetailPanel';
import TopBar from './components/layout/TopBar';
import HeroLanding from './components/onboarding/HeroLanding';
import GuidedTour from './components/onboarding/GuidedTour';
import useSelectedNode from './hooks/useSelectedNode';
import useOnboarding from './hooks/useOnboarding';

export default function App() {
  const { selectedNodeId, selectNode, clearSelection } = useSelectedNode();
  const {
    showHero,
    tourStep,
    isTourActive,
    dismissHero,
    nextTourStep,
    skipTour,
    resetOnboarding,
  } = useOnboarding();

  // Ref to hold navigateToNode from canvas
  const navigateRef = useRef(null);

  const handleNavigate = useCallback(
    (nodeId) => {
      selectNode(nodeId);
      navigateRef.current?.(nodeId);
    },
    [selectNode]
  );

  return (
    <ReactFlowProvider>
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        <TopBar
          onSelectNode={selectNode}
          onNavigate={handleNavigate}
          onHelp={resetOnboarding}
        />

        <div style={{ width: '100%', height: '100%', paddingTop: 56 }}>
          <ExplorerCanvas
            onSelectNode={selectNode}
            selectedNodeId={selectedNodeId}
            navigateRef={navigateRef}
          />
        </div>

        {selectedNodeId && (
          <DetailPanel
            nodeId={selectedNodeId}
            onClose={clearSelection}
            onNavigate={handleNavigate}
          />
        )}

        {showHero && <HeroLanding onDismiss={dismissHero} />}
        {isTourActive && (
          <GuidedTour step={tourStep} onNext={nextTourStep} onSkip={skipTour} />
        )}
      </div>
    </ReactFlowProvider>
  );
}
