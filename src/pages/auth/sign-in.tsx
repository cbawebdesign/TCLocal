import { GetServerSidePropsContext } from 'next';
import Head from 'next/head';
import Link from 'next/link';

import { useCallback, useEffect } from 'react';
import { useAuth } from 'reactfire';
import { useRouter } from 'next/router';
import { Trans, useTranslation } from 'next-i18next';

import If from '~/core/ui/If';

import configuration from '~/configuration';
import { isBrowser } from '~/core/generic/is-browser';
import getClientQueryParams from '~/core/generic/get-client-query-params';
import { getRedirectPathWithoutSearchParam } from '~/core/generic/get-redirect-url';

import { withAuthProps } from '~/lib/props/with-auth-props';
import OAuthProviders from '~/components/auth/OAuthProviders';
import EmailPasswordSignInContainer from '~/components/auth/EmailPasswordSignInContainer';
import PhoneNumberSignInContainer from '~/components/auth/PhoneNumberSignInContainer';
import EmailLinkAuth from '~/components/auth/EmailLinkAuth';
import AuthPageLayout from '~/components/auth/AuthPageLayout';
import ClientOnly from '~/core/ui/ClientOnly';

const signUpPath = configuration.paths.signUp;
const appHome = configuration.paths.appHome;
const providers = configuration.auth.providers;

const FORCE_SIGN_OUT_QUERY_PARAM = 'signOut';
const NEEDS_EMAIL_VERIFICATION_QUERY_PARAM = 'needsEmailVerification';

export const SignIn = () => {
  const router = useRouter();
  const { t } = useTranslation();

  const shouldVerifyEmail = useShouldVerifyEmail();

  const onSignIn = useCallback(() => {
    const path = getRedirectPathWithoutSearchParam(appHome);

    return router.replace(path);
  }, [router]);

  return (
    <>
      <ClientOnly>
        <SignOutRedirectHandler />
      </ClientOnly>

      <AuthPageLayout heading={<Trans i18nKey={'auth:signInHeading'} />}>
        <Head>
          <title key={'title'}>{t(`auth:signIn`)}</title>
        </Head>

        <OAuthProviders onSignIn={onSignIn} />

        <If condition={providers.emailPassword}>
          <span className={'text-xs text-gray-400'}>
            <Trans i18nKey={'auth:orContinueWithEmail'} />
          </span>

          <EmailPasswordSignInContainer
            shouldVerifyEmail={shouldVerifyEmail}
            onSignIn={onSignIn}
          />
        </If>

        <If condition={providers.phoneNumber}>
          <PhoneNumberSignInContainer onSignIn={onSignIn} />
        </If>

        <If condition={providers.emailLink}>
          <EmailLinkAuth />
        </If>

        <div className={'flex justify-center text-xs'}>
          <p className={'flex space-x-1'}>
            <span>
              <Trans i18nKey={'auth:doNotHaveAccountYet'} />
            </span>

            <Link
              className={'text-primary-800 hover:underline dark:text-primary'}
              href={signUpPath}
            >
              <Trans i18nKey={'auth:signUp'} />
            </Link>
          </p>
        </div>
      </AuthPageLayout>
    </>
  );
};

export default SignIn;

export function getServerSideProps(ctx: GetServerSidePropsContext) {
  return withAuthProps(ctx);
}

function SignOutRedirectHandler() {
  const auth = useAuth();
  const shouldSignOut = useShouldSignOut();

  // force user signOut if the query parameter has been passed
  useEffect(() => {
    if (!isBrowser()) {
      return;
    }

    if (shouldSignOut) {
      void auth.signOut();
    }
  }, [auth, shouldSignOut]);

  return null;
}

function useShouldSignOut() {
  return useQueryParam(FORCE_SIGN_OUT_QUERY_PARAM) === 'true';
}

function useShouldVerifyEmail() {
  return useQueryParam(NEEDS_EMAIL_VERIFICATION_QUERY_PARAM) === 'true';
}

function useQueryParam(param: string) {
  if (!isBrowser()) {
    return null;
  }

  const params = getClientQueryParams();

  return params.get(param);
}
