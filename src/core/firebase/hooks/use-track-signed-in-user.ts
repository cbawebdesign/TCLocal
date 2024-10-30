import { useEffect } from 'react';

import { isBrowser } from '~/core/generic/is-browser';
import { useUserId } from '~/core/hooks/use-user-id';

/**
 * @name useTrackSignedInUser
 * @description tracks the current user ID
 */
export function useTrackSignedInUser() {
  const userId = useUserId();

  useEffect(() => {
    if (!isBrowser() || !userId) {
      return;
    }

    void (async () => {
      const { getAnalytics, setUserId } = await import('firebase/analytics');

      setUserId(getAnalytics(), userId);
    })();
  }, [userId]);
}
