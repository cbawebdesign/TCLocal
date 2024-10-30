import { useCallback, useState } from 'react';
import { useAuth } from 'reactfire';
import dynamic from 'next/dynamic';
import { Cog8ToothIcon } from '@heroicons/react/24/outline';

import { useUserSession } from '~/core/hooks/use-user-session';

import Heading from '~/core/ui/Heading';
import Container from '~/core/ui/Container';

import ProfileDropdown from '../../ProfileDropdown';
import AppNavigation from './AppNavigation';
import DemoSettingsModal from '~/components/DemoSettingsModal';
import Button from '~/core/ui/Button';

import HeaderSubscriptionStatusBadge from '~/components/subscriptions/HeaderSubscriptionStatusBadge';
import OrganizationsSelector from '~/components/organizations/OrganizationsSelector';

const MobileNavigation = dynamic(() => import('~/components/MobileNavigation'));

const AppHeaderWithMenu: React.FCC = ({ children }) => {
  const userSession = useUserSession();
  const auth = useAuth();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const signOutRequested = useCallback(() => {
    return auth.signOut();
  }, [auth]);

  return (
    <>
      <div className="flex items-center justify-between border-b border-gray-50 py-2.5 dark:border-dark-700">
        <div className={'w-full px-container'}>
          <div className={'flex w-full flex-1 items-center justify-between'}>
            <div className={'flex items-center lg:hidden'}>
              <MobileNavigation />
            </div>

            <div className={'hidden lg:flex'}>
              <OrganizationsSelector displayName={true} />
            </div>

            <div className={'flex flex-1 justify-end space-x-4'}>
              <Button
                size={'small'}
                className={'hidden md:block'}
                variant={'ghost'}
                onClick={() => setSettingsOpen(true)}
              >
                <span className={'flex items-center space-x-2'}>
                  <Cog8ToothIcon className={'h-6'} />

                  <span>Demo Settings</span>
                </span>
              </Button>

              <div className={'hidden items-center lg:flex'}>
                <HeaderSubscriptionStatusBadge />
              </div>

              <ProfileDropdown
                user={userSession?.auth}
                signOutRequested={signOutRequested}
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className={'px-container py-2'}>
          <AppNavigation />
        </div>

        <div className={'border-b border-gray-100 py-6 dark:border-dark-700'}>
          <Container>
            <div className={'px-container lg:px-1.5'}>
              <Heading type={2}>
                <span className={'font-medium dark:text-white'}>
                  {children}
                </span>
              </Heading>
            </div>
          </Container>
        </div>
      </div>

      <DemoSettingsModal setIsOpen={setSettingsOpen} isOpen={settingsOpen} />
    </>
  );
};

export default AppHeaderWithMenu;
