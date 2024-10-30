import { useCallback, useEffect } from 'react';

import { useAuth, useSigninCheck } from 'reactfire';
import { parseCookies, destroyCookie } from 'nookies';
import { Trans } from 'next-i18next';

import { isBrowser } from '~/core/generic/is-browser';
import useClearFirestoreCache from '~/core/hooks/use-clear-firestore-cache';
import LoadingOverlay from '~/core/ui/LoadingOverlay';

const AuthRedirectListener: React.FCC<{
  whenSignedOut?: string;
}> = ({ children, whenSignedOut }) => {
  const auth = useAuth();
  const { status, data: signInCheck } = useSigninCheck();
  const redirectUserAway = useRedirectUserAway();
  const clearCache = useClearFirestoreCache();
  const isSignInCheckDone = status === 'success';

  useEffect(() => {
    if (!isSignInCheckDone) {
      return;
    }

    // if the session is expired, we sign the user out
    // the user will be redirected away in the next effect (because "user"
    // will become null)
    if (isSessionExpired()) {
      clearAuthCookies();
      clearCache();

      void auth.signOut();
    }
  }, [auth, clearCache, isSignInCheckDone]);

  useEffect(() => {
    // this should run once and only on success
    if (!isSignInCheckDone) {
      return;
    }

    // keep this running for the whole session
    // unless the component was unmounted, for example, on log-outs
    const listener = auth.onAuthStateChanged(async (user) => {
      // log user out if user is falsy
      // and if the consumer provided a route to redirect the user
      const shouldLogOut = !user && whenSignedOut;

      if (!user) {
        clearCache();
      }

      if (shouldLogOut) {
        return redirectUserAway(whenSignedOut);
      }
    });

    // destroy listener on un-mounts
    return () => listener();
  }, [
    auth,
    clearCache,
    isSignInCheckDone,
    redirectUserAway,
    status,
    whenSignedOut,
  ]);

  if (isSignInCheckDone && !signInCheck.signedIn) {
    return (
      <LoadingOverlay>
        <Trans i18nKey={'auth:signingOut'} />
      </LoadingOverlay>
    );
  }

  return <>{children}</>;
};

export default function GuardedPage({
  children,
  whenSignedOut,
}: React.PropsWithChildren<{
  whenSignedOut?: string;
}>) {
  const shouldActivateListener = isBrowser();

  // we only activate the listener if
  // we are rendering in the browser
  if (!shouldActivateListener) {
    return <>{children}</>;
  }

  return (
    <AuthRedirectListener whenSignedOut={whenSignedOut}>
      {children}
    </AuthRedirectListener>
  );
}

function isSessionExpired() {
  const expiresAt = getExpiresAtCookie();
  const date = new Date();
  const now = new Date(date.toISOString()).getTime();

  return !expiresAt || now > expiresAt;
}

function getExpiresAtCookie() {
  const cookies = parseCookies();
  const value = cookies[`sessionExpiresAt`];

  if (!Number.isNaN(Number(value))) {
    return Number(value);
  }
}

function useRedirectUserAway() {
  return useCallback((path: string) => {
    const currentPath = window.location.pathname;
    const isNotCurrentPage = currentPath !== path;

    clearAuthCookies();

    // we then redirect the user to the page
    // specified in the props of the component
    if (isNotCurrentPage) {
      window.location.replace(path);
    }
  }, []);
}

function clearAuthCookies() {
  destroyCookie(null, 'sessionExpiresAt');
  destroyCookie(null, 'session');
}
