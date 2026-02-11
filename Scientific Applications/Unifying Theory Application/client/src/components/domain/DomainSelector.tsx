import { useState } from 'react';
import type { DomainPack } from '../../api/client';
import DomainCard from './DomainCard';
import CustomDomainForm from './CustomDomainForm';
import { useDomains } from '../../hooks/useDomains';

interface DomainSelectorProps {
  domains: DomainPack[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  onCustomCreated: () => void;
  loading?: boolean;
}

export default function DomainSelector({
  domains,
  selectedIds,
  onToggle,
  onCustomCreated,
  loading,
}: DomainSelectorProps) {
  const [showForm, setShowForm] = useState(false);
  const { createCustom } = useDomains();

  const handleCreateCustom = async (data: Parameters<typeof createCustom>[0]) => {
    await createCustom(data);
    setShowForm(false);
    onCustomCreated();
  };

  if (loading) {
    return (
      <div className="loading-center">
        <div className="spinner" />
      </div>
    );
  }

  if (showForm) {
    return (
      <CustomDomainForm
        onSubmit={handleCreateCustom}
        onCancel={() => setShowForm(false)}
      />
    );
  }

  return (
    <div>
      {domains.map((domain) => (
        <DomainCard
          key={domain.id}
          domain={domain}
          selected={selectedIds.includes(domain.id)}
          onToggle={() => onToggle(domain.id)}
        />
      ))}
      <button
        className="btn"
        onClick={() => setShowForm(true)}
        style={{ width: '100%', marginTop: 'var(--sp-2)' }}
      >
        + Custom Domain
      </button>
    </div>
  );
}
