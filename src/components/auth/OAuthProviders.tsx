import { useCallback, useRef, useState } from 'react';
import { Trans } from 'next-i18next';
import dynamic from 'next/dynamic';

import { MultiFactorError, User, UserCredential } from 'firebase/auth';

import type { FirebaseError } from 'firebase/app';

import AuthProviderButton from '~/core/ui/AuthProviderButton';
import { useSignInWithProvider } from '~/core/firebase/hooks';
import { getFirebaseErrorCode } from '~/core/firebase/utils/get-firebase-error-code';

import If from '~/core/ui/If';
import LoadingOverlay from '~/core/ui/LoadingOverlay';

import AuthErrorMessage from './AuthErrorMessage';
import MultiFactorAuthChallengeModal from '~/components/auth/MultiFactorAuthChallengeModal';
import { isMultiFactorError } from '~/core/firebase/utils/is-multi-factor-error';
import useCreateServerSideSession from '~/core/hooks/use-create-server-side-session';

import configuration from '~/configuration';

const OAUTH_PROVIDERS = configuration.auth.providers.oAuth;

const OAuthRedirectHandler = dynamic(() => import('./OAuthRedirectHandler'), {
  ssr: false
});

const OAuthProviders: React.FCC<{
  onSignIn: () => unknown;
  useRedirectStrategy?: boolean;
}> = ({
        onSignIn,
        useRedirectStrategy = configuration.auth.useRedirectStrategy
      }) => {
  const onSignInError = useCallback((error: FirebaseError | unknown) => {
    if (isMultiFactorError(error)) {
      setMultiFactorAuthError(error);
    } else {
      throw getFirebaseErrorCode(error);
    }
  }, []);

  const signInWithProvider = useSignInWithProvider({ useRedirectStrategy, onError: onSignInError });
  const sessionRequest = useCreateServerSideSession();
  const isSigningIn = useRef(false);

  const [multiFactorAuthError, setMultiFactorAuthError] =
    useState<Maybe<MultiFactorError>>();

  const createSession = useCallback(
    async (user: User) => {
      if (isSigningIn.current) {
        return;
      }

      isSigningIn.current = true;

      try {
        await sessionRequest.trigger(user);

        onSignIn();
      } finally {
        isSigningIn.current = false;
      }
    },
    [sessionRequest, onSignIn]
  );

  const onSignInWithProvider = useCallback(
    async (signInRequest: () => Promise<UserCredential | undefined>) => {
      try {
        const credential = await signInRequest();

        if (!credential) {
          return Promise.reject();
        }

        if (!useRedirectStrategy) {
          await createSession(credential.user);
        }
      } catch (error) {
        onSignInError(error as FirebaseError);
      }
    },
    [createSession, onSignInError, useRedirectStrategy]
  );

  if (!OAUTH_PROVIDERS || !OAUTH_PROVIDERS.length) {
    return null;
  }

  // we display an error message if there's an error
  const shouldDisplayError = signInWithProvider.error || sessionRequest.error;

  const isLoading = Boolean(
    signInWithProvider.isMutating ||
    sessionRequest.isMutating ||
    sessionRequest.data
  );

  return (
    <>
      <If condition={isLoading}>
        <LoadingIndicator />
      </If>

      <OAuthRedirectHandler onSignIn={createSession} onError={onSignInError}>
        <LoadingIndicator />
      </OAuthRedirectHandler>

      <div className={'flex w-full flex-1 flex-col space-y-3'}>
        <div className={'flex-col space-y-2'}>
          {OAUTH_PROVIDERS.map((OAuthProviderClass) => {
            const providerInstance = new OAuthProviderClass();
            const providerId = providerInstance.providerId;

            return (
              <AuthProviderButton
                key={providerId}
                providerId={providerId}
                onClick={() => {
                  return onSignInWithProvider(() =>
                    signInWithProvider.trigger(providerInstance)
                  );
                }}
              >
                <Trans
                  i18nKey={'auth:signInWithProvider'}
                  values={{
                    provider: getProviderName(providerId)
                  }}
                />
              </AuthProviderButton>
            );
          })}
        </div>

        <If condition={shouldDisplayError}>
          {(error) => <AuthErrorMessage error={getFirebaseErrorCode(error)} />}
        </If>
      </div>

      <If condition={multiFactorAuthError}>
        {(error) => (
          <MultiFactorAuthChallengeModal
            error={error}
            isOpen={true}
            setIsOpen={(isOpen: boolean) => {
              setMultiFactorAuthError(undefined);

              // when the MFA modal gets closed without verification
              // we reset the state
              if (!isOpen) {
                signInWithProvider.reset();
              }
            }}
            onSuccess={(credential) => {
              return createSession(credential.user);
            }}
          />
        )}
      </If>
    </>
  );
};

function getProviderName(providerId: string) {
  const capitalize = (value: string) =>
    value.slice(0, 1).toUpperCase() + value.slice(1);

  if (providerId.endsWith('.com')) {
    return capitalize(providerId.split('.com')[0]);
  }

  return capitalize(providerId);
}

function LoadingIndicator() {
  return (
    <LoadingOverlay
      displayLogo={false}
      className={'m-0 !h-full !w-full rounded-xl'}
    >
      <Trans i18nKey={'auth:signingIn'} />
    </LoadingOverlay>
  );
}

export default OAuthProviders;
