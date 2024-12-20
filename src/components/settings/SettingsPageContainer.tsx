import React from 'react';
import RouteShell from '~/components/RouteShell';
import NavigationMenu from '~/core/ui/Navigation/NavigationMenu';
import NavigationItem from '~/core/ui/Navigation/NavigationItem';
import { Trans } from 'next-i18next';

const links = [
  {
    path: '/settings/profile',
    i18n: 'common:profileSettingsTabLabel',
  },
  {
    path: '/settings/organization',
    i18n: 'common:organizationSettingsTabLabel',
  },
 
];

const SettingsPageContainer: React.FCC<{
  title: string;
}> = ({ children, title }) => {
  return (
    <RouteShell
      title={title}
      description={<Trans i18nKey={'common:settingsTabDescription'} />}
    >
      <NavigationMenu bordered>
        {links.map((link) => (
          <NavigationItem
            className={'flex-1 lg:flex-none'}
            link={link}
            key={link.path}
          />
        ))}
      </NavigationMenu>

      <div
        className={`mt-4 flex h-full flex-col space-y-4 lg:flex-row lg:space-y-0 lg:space-x-8`}
      >
        {children}
      </div>
    </RouteShell>
  );
};

export default SettingsPageContainer;
