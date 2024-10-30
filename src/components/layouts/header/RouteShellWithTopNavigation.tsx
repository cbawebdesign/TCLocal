import AppHeaderWithMenu from './AppHeaderWithMenu';
import Container from '~/core/ui/Container';

type RouteShellWithTopNavigationProps = {
  title?: string | React.ReactNode;
};

const RouteShellWithTopNavigation: React.FCC<
  RouteShellWithTopNavigationProps
> = ({ title, children }) => {
  return (
    <div className={'flex flex-1'}>
      <div className={'relative w-full'}>
        {title ? <AppHeaderWithMenu>{title}</AppHeaderWithMenu> : null}

        <div className={'p-4'}>
          <Container>{children}</Container>
        </div>
      </div>
    </div>
  );
};

export default RouteShellWithTopNavigation;
