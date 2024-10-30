import configuration from '~/configuration';

import {
  CreditCardIcon,
  Squares2X2Icon,
  Square3Stack3DIcon,
  UserGroupIcon,
  UserIcon,
} from '@heroicons/react/24/outline';

type Divider = {
  divider: true;
};

type NavigationItemLink = {
  label: string;
  path: string;
  Icon: (props: { className: string }) => JSX.Element;
  end?: boolean;
};

type NavigationGroup = {
  label: string;
  collapsible?: boolean;
  collapsed?: boolean;
  children: NavigationItemLink[];
};

type NavigationItem = NavigationItemLink | NavigationGroup | Divider;

type NavigationConfig = {
  items: NavigationItem[];
};

const NAVIGATION_CONFIG: NavigationConfig = {
  items: [
    {
      label: 'common:dashboardTabLabel',
      path: configuration.paths.appHome,
      Icon: ({ className }: { className: string }) => {
        return <Squares2X2Icon className={className} />;
      },
    },
   
    {
      label: 'common:settingsTabLabel',
      collapsible: false,
      children: [
        {
          label: 'common:profileSettingsTabLabel',
          path: configuration.paths.settings.profile,
          Icon: ({ className }: { className: string }) => {
            return <UserIcon className={className} />;
          },
        },
    
     
      ],
    },
  ],
};

export default NAVIGATION_CONFIG;
