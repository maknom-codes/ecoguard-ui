import { useState, useEffect, useCallback } from 'react';
import { GraphQLClient } from '../services/api';

const GET_AUTH_STATUS_QUERY = `
  query GetMe {
    authCheck {
      message
      authenticated
    }
  }
`;

export function useAuthNative() {
  const [data, setData] = useState<{ authCheck: any } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMe = useCallback(async () => {
    const client = new GraphQLClient();
    setLoading(true);
    setError(null);

    try {
      const result = await client.execute<{authCheck: {message: string, authenticated: boolean}}>(GET_AUTH_STATUS_QUERY);
      setData(result);
    } catch (err: any) {
      console.error("[NativeAuth] Erreur lors de la vérification:", err);
      setError(err);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  return { 
    data, 
    loading, 
    error, 
    refetch: fetchMe,
    isAuthenticated: data?.authCheck?.authenticated
  };
}
