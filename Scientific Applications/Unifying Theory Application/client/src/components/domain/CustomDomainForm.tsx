import { useState } from 'react';
import type { DomainConcept } from '../../api/client';

interface CustomDomainFormProps {
  onSubmit: (data: {
    name: string;
    description: string;
    concepts: DomainConcept[];
    exampleInvariants?: string[];
  }) => Promise<void>;
  onCancel: () => void;
}

type RoleOption = '' | 'Frame' | 'Gradient' | 'Vector';

export default function CustomDomainForm({ onSubmit, onCancel }: CustomDomainFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [concepts, setConcepts] = useState<
    { name: string; description: string; role: RoleOption }[]
  >([{ name: '', description: '', role: '' }]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addConcept = () => {
    setConcepts((prev) => [...prev, { name: '', description: '', role: '' }]);
  };

  const removeConcept = (index: number) => {
    setConcepts((prev) => prev.filter((_, i) => i !== index));
  };

  const updateConcept = (index: number, field: string, value: string) => {
    setConcepts((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: value } : c))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) {
      setError('Name and description are required');
      return;
    }
    const validConcepts = concepts.filter((c) => c.name.trim());
    if (validConcepts.length === 0) {
      setError('At least one concept is required');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim(),
        concepts: validConcepts.map((c) => ({
          name: c.name.trim(),
          description: c.description.trim(),
          ...(c.role ? { suggestedRole: c.role as 'Frame' | 'Gradient' | 'Vector' } : {}),
        })),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create domain');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h3 style={styles.heading}>Create Custom Domain</h3>

      {error && <div className="alert alert-error">{error}</div>}

      <div style={styles.field}>
        <label style={styles.label}>Domain Name</label>
        <input
          className="input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Thermodynamics"
        />
      </div>

      <div style={styles.field}>
        <label style={styles.label}>Description</label>
        <textarea
          className="textarea"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description of the domain..."
          style={{ minHeight: '80px' }}
        />
      </div>

      <div style={styles.field}>
        <label style={styles.label}>Concepts</label>
        {concepts.map((concept, i) => (
          <div key={i} style={styles.conceptRow}>
            <input
              className="input"
              value={concept.name}
              onChange={(e) => updateConcept(i, 'name', e.target.value)}
              placeholder="Concept name"
              style={{ flex: 1 }}
            />
            <input
              className="input"
              value={concept.description}
              onChange={(e) => updateConcept(i, 'description', e.target.value)}
              placeholder="Description"
              style={{ flex: 2 }}
            />
            <select
              className="input"
              value={concept.role}
              onChange={(e) => updateConcept(i, 'role', e.target.value)}
              style={{ flex: 0, width: '100px', minWidth: '100px' }}
            >
              <option value="">Role...</option>
              <option value="Frame">Frame</option>
              <option value="Gradient">Gradient</option>
              <option value="Vector">Vector</option>
            </select>
            {concepts.length > 1 && (
              <button
                type="button"
                onClick={() => removeConcept(i)}
                style={styles.removeBtn}
                title="Remove concept"
              >
                x
              </button>
            )}
          </div>
        ))}
        <button type="button" className="btn" onClick={addConcept} style={{ marginTop: 'var(--sp-2)' }}>
          + Add Concept
        </button>
      </div>

      <div style={styles.actions}>
        <button type="button" className="btn" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Creating...' : 'Create Domain'}
        </button>
      </div>
    </form>
  );
}

const styles: Record<string, React.CSSProperties> = {
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--sp-4)',
  },
  heading: {
    fontSize: 'var(--fs-base)',
    fontWeight: 600,
    marginBottom: 'var(--sp-2)',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--sp-2)',
  },
  label: {
    fontSize: 'var(--fs-xs)',
    fontWeight: 600,
    color: 'var(--color-text-muted)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  conceptRow: {
    display: 'flex',
    gap: 'var(--sp-2)',
    alignItems: 'center',
  },
  removeBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--color-error)',
    cursor: 'pointer',
    fontSize: 'var(--fs-base)',
    padding: 'var(--sp-1)',
    lineHeight: 1,
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 'var(--sp-2)',
    paddingTop: 'var(--sp-2)',
  },
};
