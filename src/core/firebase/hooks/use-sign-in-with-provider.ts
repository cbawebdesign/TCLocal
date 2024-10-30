import { useAuth } from 'reactfire';
import useSWRMutation from 'swr/mutation';
import { AuthProvider, Auth } from 'firebase/auth';
import configuration from '~/configuration';

export function useSignInWithProvider(params: {
  useRedirectStrategy?: boolean;
  onError: (error: unknown) => unknown;
}) {
  const auth = useAuth();

  return useSWRMutation(
    'signInWithProvider',
    async (_, { arg: provider }: { arg: AuthProvider }) => {
      try {
        return getCredential(auth, provider, params.useRedirectStrategy);
      } catch (error) {
        params.onError(error);
        return Promise.reject(error);
      }
    },
  );
}

async function getCredential(
  auth: Auth,
  provider: AuthProvider,
  useRedirectStrategy = configuration.auth.useRedirectStrategy,
) {
  const user = auth.currentUser;

  if (user) {
    if (useRedirectStrategy) {
      const { browserPopupRedirectResolver, reauthenticateWithRedirect } =
        await import('firebase/auth');

      return reauthenticateWithRedirect(
        user,
        provider,
        browserPopupRedirectResolver,
      );
    }

    const { browserPopupRedirectResolver, reauthenticateWithPopup } =
      await import('firebase/auth');

    return reauthenticateWithPopup(
      user,
      provider,
      browserPopupRedirectResolver,
    );
  }

  if (useRedirectStrategy) {
    const { browserPopupRedirectResolver, signInWithRedirect } = await import(
      'firebase/auth'
    );

    return signInWithRedirect(auth, provider, browserPopupRedirectResolver);
  }

  const { signInWithPopup, browserPopupRedirectResolver } = await import(
    'firebase/auth'
  );

  return signInWithPopup(auth, provider, browserPopupRedirectResolver);
}
