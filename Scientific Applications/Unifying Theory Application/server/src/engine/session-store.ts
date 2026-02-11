import { v4 as uuidv4 } from 'uuid';
import type { ModeType, Session, SessionState } from '../types/session.types.js';

/**
 * In-memory session store.
 * Manages session lifecycle: creation, retrieval, mutation, and deletion.
 * Sessions are lost on server restart — intentional for the prototype layer.
 */
export class SessionStore {
  private sessions: Map<string, Session> = new Map();

  /**
   * Create a new session with the given mode.
   * Initialises an empty pipeline state with no domains, step 0, and no result.
   */
  create(mode: ModeType): Session {
    const id = uuidv4();
    const session: Session = {
      id,
      createdAt: new Date().toISOString(),
      state: {
        mode,
        selectedDomains: [],
        currentStep: 0,
        steps: [],
        result: null,
        error: null,
      },
    };
    this.sessions.set(id, session);
    return session;
  }

  /**
   * Retrieve a session by its id.
   * Returns undefined if the session does not exist.
   */
  get(id: string): Session | undefined {
    return this.sessions.get(id);
  }

  /**
   * Merge a partial state patch into the session's current state.
   * Throws if the session does not exist.
   */
  update(id: string, patch: Partial<SessionState>): Session {
    const session = this.sessions.get(id);
    if (!session) {
      throw new Error(`SessionStore: session "${id}" not found.`);
    }
    session.state = { ...session.state, ...patch };
    this.sessions.set(id, session);
    return session;
  }

  /**
   * Remove a session from the store.
   * No-op if the session does not exist.
   */
  delete(id: string): void {
    this.sessions.delete(id);
  }
}
