import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { ApiError } from '../services/api';
import { careApi } from '../services/care';
import type { CareSummary } from '../types/care';

export function useCare() {
  const { logout } = useAuth();
  const [summary, setSummary] = useState<CareSummary | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pending = useRef(false);
  const focused = useRef(false);

  const run = useCallback(async (operation: () => Promise<CareSummary>) => {
    if (pending.current) return false;
    pending.current = true;
    setBusy(true);
    setError(null);
    try {
      const data = await operation();
      if (focused.current) setSummary(data);
      return true;
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) await logout();
      if (focused.current) setError(e instanceof ApiError ? e.message : '서버 연결을 확인한 뒤 다시 시도해 주세요.');
      return false;
    } finally {
      pending.current = false;
      if (focused.current) setBusy(false);
    }
  }, [logout]);

  const refresh = useCallback(() => run(careApi.evaluate), [run]);
  useFocusEffect(useCallback(() => {
    focused.current = true;
    void refresh();
    return () => { focused.current = false; };
  }, [refresh]));
  return { summary, busy, error, run, refresh };
}
