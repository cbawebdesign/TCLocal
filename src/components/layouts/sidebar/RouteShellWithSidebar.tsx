import { useEffect } from 'react';

import { isBrowser } from '~/core/generic/is-browser';
import AppSidebar from './AppSidebar';
import { Page, PageBody, PageHeader } from '~/core/ui/Page';
import MobileAppNavigation from '~/components/MobileNavigation';

type HeaderProps =
  | {
      title: string | React.ReactNode;
      description?: string | React.ReactNode;
    }
  | {
      header: React.ReactNode;
    };

export type RouteShellWithSidebarProps = HeaderProps | {};

const RouteShellWithSidebar: React.FCC<RouteShellWithSidebarProps> = ({
  children,
  ...props
}) => {
  useDisableBodyScrolling();

  return (
    <Page sidebar={<AppSidebar />}>
      <RouteShellHeader {...props} />

      <PageBody>{children}</PageBody>
    </Page>
  );
};

export default RouteShellWithSidebar;

function RouteShellHeader(props: RouteShellWithSidebarProps) {
  const isVoid = !props || !('title' in props || 'header' in props);

  if (isVoid) {
    return null;
  }

  if ('header' in props) {
    return props.header;
  }

  return (
    <PageHeader
      mobileNavigation={<MobileAppNavigation />}
      title={props.title}
      description={props.description}
    />
  );
}

function useDisableBodyScrolling() {
  useEffect(() => {
    if (!isBrowser()) {
      return;
    }

    document.body.style.setProperty('overflow', 'hidden');

    return () => {
      document.body.style.removeProperty('overflow');
    };
  }, []);
}
