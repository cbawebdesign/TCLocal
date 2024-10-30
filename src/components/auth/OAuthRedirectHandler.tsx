import { useLayoutEffect, useState } from 'react';
import { useAuth } from 'reactfire';

import {
  browserPopupRedirectResolver,
  getRedirectResult,
  User
} from 'firebase/auth';

import type { FirebaseError } from 'firebase/app';

let didCheckRedirect = false;
let didSignIn: boolean | null = null;

export default function OAuthRedirectHandler(
  {
    onSignIn,
    onError,
    children
  }: React.PropsWithChildren<{
    onSignIn: (user: User) => unknown;
    onError: (error: FirebaseError) => unknown;
  }>) {
  const auth = useAuth();
  const [checkingRedirect, setCheckingRedirecting] = useState(true);

  useLayoutEffect(() => {
    const interval = setInterval(() => {
      if (didCheckRedirect) {
        if (didSignIn === false) {
          setCheckingRedirecting(false);
          clearInterval(interval);
        }
      }
    }, 250);

    return () => clearInterval(interval);
  }, []);

  useLayoutEffect(() => {
    async function checkRedirectSignIn() {
      // prevent multiple calls
      if (didCheckRedirect) {
        return;
      }

      didCheckRedirect = true;

      try {
        const credential = await getRedirectResult(
          auth,
          browserPopupRedirectResolver
        ).catch((error) => {
          onError(error as FirebaseError);

          return null;
        });

        didSignIn = !!credential;

        if (credential) {
          await onSignIn(credential.user);
        } else {
          setCheckingRedirecting(false);
        }
      } catch (e) {
        onError(e as FirebaseError);
        setCheckingRedirecting(false);
      }
    }

    void checkRedirectSignIn();
  }, [auth, onSignIn, checkingRedirect, onError, checkingRedirect]);

  if (checkingRedirect) {
    return children;
  }

  return null;
}
