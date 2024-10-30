import Head from 'next/head';
import dynamic from 'next/dynamic';

import { useSigninCheck } from 'reactfire';

import configuration from '~/configuration';
import { LayoutStyle } from '~/core/layout-style';
import Layout from '~/core/ui/Layout';
import { LayoutStyleContext } from '~/lib/contexts/layout';
import { isBrowser } from '~/core/generic/is-browser';

const FirebaseFirestoreProvider = dynamic(
  () => import('~/core/firebase/components/FirebaseFirestoreProvider'),
);

const SentryProvider = dynamic(() => import('~/components/SentryProvider'));

const GuardedPage = dynamic(
  () => import('~/core/firebase/components/GuardedPage'),
);

const RouteShellWithSidebar = dynamic(
  () => import('./layouts/sidebar/RouteShellWithSidebar'),
);

const RouteShellWithTopNavigation = dynamic(
  () => import('./layouts/header/RouteShellWithTopNavigation'),
);

const Toaster = dynamic(() => import('~/core/ui/Toaster'), {
  ssr: false,
});

type RouteShellProps = (
  | {
      title: string | React.ReactNode;
      description?: string | React.ReactNode;
    }
  | {
      header?: React.ReactNode;
    }
) & {
  style?: LayoutStyle;
};

const RouteShell: React.FCC<RouteShellProps> = (props) => {
  const redirectPath = useRedirectPathWhenSignedOut();

  return (
    <FirebaseFirestoreProvider>
      <PageTitle title={'title' in props && props.title} />

      <GuardedPage whenSignedOut={redirectPath}>
        <SentryProvider>
          <Layout>
            <Toaster richColors={false} position={'top-center'} />

            <LayoutStyleContext.Consumer>
              {({ layoutStyle }) => {
                return (
                  <LayoutRenderer style={layoutStyle} {...props}>
                    <OnAuthReady>{props.children}</OnAuthReady>
                  </LayoutRenderer>
                );
              }}
            </LayoutStyleContext.Consumer>
          </Layout>
        </SentryProvider>
      </GuardedPage>
    </FirebaseFirestoreProvider>
  );
};

function LayoutRenderer(props: React.PropsWithChildren<RouteShellProps>) {
  const layout = props.style ?? configuration.navigation.style;

  switch (layout) {
    case LayoutStyle.Sidebar: {
      return (
        <RouteShellWithSidebar {...props}>
          {props.children}
        </RouteShellWithSidebar>
      );
    }

    case LayoutStyle.TopHeader: {
      return (
        <RouteShellWithTopNavigation {...props}>
          {props.children}
        </RouteShellWithTopNavigation>
      );
    }

    case LayoutStyle.Custom:
      return <>{props.children}</>;
  }
}

export default RouteShell;

function OnAuthReady(props: React.PropsWithChildren) {
  const signIn = useSigninCheck();

  if (signIn.status === 'loading') {
    return null;
  }

  if (signIn.status === 'error') {
    return null;
  }

  if (signIn.data.signedIn) {
    return props.children;
  }

  return null;
}

function useRedirectPathWhenSignedOut() {
  const paths = configuration.paths;

  const queryParam = new URLSearchParams({
    signOut: 'true',
  });

  return `${paths.signIn}?${queryParam.toString()}`;
}

function PageTitle(props: { title?: string | React.ReactNode }) {
  if (!props.title || typeof props.title !== 'string') {
    return null;
  }

  return (
    <Head>
      <title key="title">{props.title}</title>
    </Head>
  );
}
