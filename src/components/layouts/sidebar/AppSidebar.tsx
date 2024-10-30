import { useContext } from 'react';
import classNames from 'clsx';
import Link from 'next/link';
import { useAuth } from 'reactfire';
import { Trans } from 'next-i18next';

import {
  ArrowLeftCircleIcon,
  ArrowRightCircleIcon,
} from '@heroicons/react/24/outline';

import AppSidebarNavigation from './AppSidebarNavigation';
import Sidebar, { SidebarContent } from '~/core/ui/Sidebar';
import OrganizationsSelector from '~/components/organizations/OrganizationsSelector';
import { SidebarContext } from '~/core/contexts/sidebar';
import ProfileDropdown from '~/components/ProfileDropdown';

import { Tooltip, TooltipContent, TooltipTrigger } from '~/core/ui/Tooltip';
import { useUserSession } from '~/core/hooks/use-user-session';
import { useCurrentOrganization } from '~/lib/organizations/hooks/use-current-organization';
import SubscriptionStatusBadge from '~/components/subscriptions/SubscriptionStatusBadge';

const AppSidebar = () => {
  const ctx = useContext(SidebarContext);

  return (
    <Sidebar collapsed={ctx.collapsed}>
      <SidebarContent className={'mt-4'}>
        <OrganizationsSelector displayName={!ctx.collapsed} />
      </SidebarContent>

      <SidebarContent className={`h-[calc(100%-160px)] overflow-y-auto`}>
        <AppSidebarNavigation />
      </SidebarContent>

      <div className={'absolute bottom-0 w-full bg-background'}>
        <SidebarContent>
          <ProfileDropdownContainer collapsed={ctx.collapsed} />
        </SidebarContent>
      </div>
    </Sidebar>
  );
};

export default AppSidebar;

function AppSidebarFooterMenu() {
  const { collapsed, setCollapsed } = useContext(SidebarContext);

  return <CollapsibleButton collapsed={collapsed} onClick={setCollapsed} />;
}

function CollapsibleButton({
  collapsed,
  onClick,
}: React.PropsWithChildren<{
  collapsed: boolean;
  onClick: (collapsed: boolean) => void;
}>) {
  const className = classNames(
    `bg-background absolute -right-[10px] bottom-[30px] cursor-pointer block`,
  );

  const iconClassName =
    'bg-background text-gray-300 dark:text-gray-600 h-5 w-5';

  return (
    <Tooltip>
      <TooltipTrigger
        className={className}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        onClick={() => onClick(!collapsed)}
      >
        <ArrowRightCircleIcon
          className={classNames(iconClassName, {
            hidden: !collapsed,
          })}
        />

        <ArrowLeftCircleIcon
          className={classNames(iconClassName, {
            hidden: collapsed,
          })}
        />
      </TooltipTrigger>

      <TooltipContent sideOffset={20}>
        <Trans i18nKey={'common:expandSidebar'} />
      </TooltipContent>
    </Tooltip>
  );
}

function ProfileDropdownContainer(props: { collapsed: boolean }) {
  const userSession = useUserSession();
  const auth = useAuth();

  return (
    <div
      className={classNames('flex flex-col space-y-4', {
        ['py-4']: !props.collapsed,
        ['py-6']: props.collapsed,
      })}
    >
      <StatusBadge />

      <ProfileDropdown
        displayName={!props.collapsed}
        className={'w-full'}
        user={userSession?.auth}
        signOutRequested={() => auth.signOut()}
      />

      <AppSidebarFooterMenu />
    </div>
  );
}

function StatusBadge() {
  const organization = useCurrentOrganization();
  const subscription = organization?.subscription;

  const isActive = ['active', 'trialing'].includes(
    subscription?.status ?? 'free',
  );

  // if the organization has an active subscription
  // we do not show the subscription status badge
  if (isActive || !subscription) {
    return null;
  }

  const href = `/settings/subscription`;

  // in all other cases we show the subscription status badge
  // which will show the subscription status and a link to the subscription page
  return (
    <Link href={href}>
      <SubscriptionStatusBadge subscription={subscription} />
    </Link>
  );
}
