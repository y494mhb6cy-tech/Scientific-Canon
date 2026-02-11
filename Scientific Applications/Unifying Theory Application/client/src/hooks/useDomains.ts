import { useState, useEffect, useCallback } from 'react';
import {
  listDomains,
  createCustomDomain,
  type DomainPack,
  type DomainConcept,
} from '../api/client';

export function useDomains() {
  const [domains, setDomains] = useState<DomainPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDomains = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listDomains();
      setDomains(res.domains);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load domains');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDomains();
  }, [fetchDomains]);

  const createCustom = useCallback(
    async (data: {
      name: string;
      description: string;
      concepts: DomainConcept[];
      exampleInvariants?: string[];
    }) => {
      try {
        const newDomain = await createCustomDomain(data);
        setDomains((prev) => [...prev, newDomain]);
        return newDomain;
      } catch (err) {
        throw err instanceof Error ? err : new Error('Failed to create domain');
      }
    },
    []
  );

  return { domains, loading, error, createCustom, refetch: fetchDomains };
}
