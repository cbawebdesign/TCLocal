import { useContext } from 'react';
import classNames from 'clsx';
import Link from 'next/link';
import { useAuth } from 'reactfire';

import {
  ArrowLeftCircleIcon,
  ArrowRightCircleIcon,
  HomeIcon,
  UserGroupIcon,
  BellIcon,
  Cog6ToothIcon,
  UserIcon
} from '@heroicons/react/24/outline';

import AppSidebarNavigation from './AppSidebarNavigation';
import { SidebarContext } from '~/core/contexts/sidebar';
import OrganizationsSelector from '~/components/organizations/OrganizationsSelector';
import ProfileDropdown from '~/components/ProfileDropdown';
import { useUserSession } from '~/core/hooks/use-user-session';
import { useCurrentOrganization } from '~/lib/organizations/hooks/use-current-organization';
import SubscriptionStatusBadge from '~/components/subscriptions/SubscriptionStatusBadge';

const AppTopbar = () => {
  const ctx = useContext(SidebarContext);

  return (
    <header className="fixed top-0 left-0 w-full bg-background z-50">
      <div className="w-full bg-background flex items-center justify-between px-4 py-2 shadow">
        {/* Main Container with even spacing */}
        <div className="w-full flex items-center justify-between max-w-7xl mx-auto">
          {/* Left Section */}
          <div className="flex-shrink-0">
            <OrganizationsSelector displayName={!ctx.collapsed} />
          </div>

          {/* Center Navigation - Now using space-x for even spacing */}
          <div className="flex-grow flex justify-center items-center px-4">
            <div className="flex items-center space-x-8">
              <AppSidebarNavigation />
            </div>
          </div>

          {/* Right Section - Profile and Status */}
          <div className="flex-shrink-0 flex items-center space-x-4">
            <StatusBadge />
            <ProfileDropdownContainer collapsed={ctx.collapsed} />
          </div>
        </div>
      </div>
    </header>
  );
};

function ProfileDropdownContainer(props: { collapsed: boolean }) {
  const userSession = useUserSession();
  const auth = useAuth();

  return (
    <div
      className={classNames('flex items-center', {
        'py-2': !props.collapsed,
        'py-3': props.collapsed,
      })}
    >
      <ProfileDropdown
        displayName={!props.collapsed}
        className="w-full"
        user={userSession?.auth}
        signOutRequested={() => auth.signOut()}
      />
    </div>
  );
}

function StatusBadge() {
  const organization = useCurrentOrganization();
  const subscription = organization?.subscription;

  const isActive = ['active', 'trialing'].includes(
    subscription?.status ?? 'free',
  );

  if (isActive || !subscription) {
    return null;
  }

  const href = '/settings/subscription';

  return (
    <Link href={href}>
      <SubscriptionStatusBadge subscription={subscription} />
    </Link>
  );
}

export default AppTopbar;