import configuration from '~/configuration';

import {
  CreditCardIcon,
  Squares2X2Icon,
  Square3Stack3DIcon,
  UserGroupIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { BellIcon, CogIcon, ViewIcon } from 'lucide-react';

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
      label: 'common:watchlistlabel',
      path: '/watchlist',
      Icon: ({ className }: { className: string }) => {
        return <ViewIcon className={className} />;
      },
    },
    {
      label: 'common:alertslabel',
      path: configuration.paths.appHome,
      Icon: ({ className }: { className: string }) => {
        return <BellIcon className={className} />;
      },
    },
    {
      label: 'common:configlabel',
      path: '/config',
      Icon: ({ className }: { className: string }) => {
        return <CogIcon className={className} />;
      },
    },
    
        {
          label: 'common:profileSettingsTabLabel',
          path: configuration.paths.settings.profile,
          Icon: ({ className }: { className: string }) => {
            return <UserIcon className={className} />;
          },
        },
    
  
   
  ],
};

export default NAVIGATION_CONFIG;
