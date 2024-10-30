import NAVIGATION_CONFIG from '../../../navigation.config';

import NavigationItem from '~/core/ui/Navigation/NavigationItem';
import NavigationMenu from '~/core/ui/Navigation/NavigationMenu';
import NavigationContainer from '~/core/ui/Navigation/NavigationContainer';

const AppNavigation: React.FCC = () => {
  return (
    <NavigationContainer>
      <NavigationMenu bordered>
        {NAVIGATION_CONFIG.items.map((item) => {
          if ('children' in item) {
            return item.children.map((child) => {
              return <NavigationItem key={child.path} link={child} />;
            });
          }

          // we don't render dividers
          if ('divider' in item) return null;

          return <NavigationItem key={item.path} link={item} />;
        })}
      </NavigationMenu>
    </NavigationContainer>
  );
};

export default AppNavigation;
