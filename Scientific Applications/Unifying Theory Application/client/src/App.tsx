import { Routes, Route, Navigate } from 'react-router-dom';
import { SessionProvider } from './context/SessionContext';
import { ModeProvider } from './context/ModeContext';
import Header from './components/layout/Header';
import GuidedMode from './components/modes/GuidedMode';
import ExpertMode from './components/modes/ExpertMode';
import AuditMode from './components/modes/AuditMode';

export default function App() {
  return (
    <SessionProvider>
      <ModeProvider>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Header />
          <main style={{ flex: 1, display: 'flex' }}>
            <Routes>
              <Route path="/" element={<Navigate to="/guided" replace />} />
              <Route path="/guided" element={<GuidedMode />} />
              <Route path="/expert" element={<ExpertMode />} />
              <Route path="/audit" element={<AuditMode />} />
            </Routes>
          </main>
        </div>
      </ModeProvider>
    </SessionProvider>
  );
}
