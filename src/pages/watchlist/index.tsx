import { GetServerSidePropsContext } from 'next';
import dynamic from 'next/dynamic';
import { Trans } from 'next-i18next';

import { withAppProps } from '~/lib/props/with-app-props';
import RouteShell from '~/components/RouteShell';
import { LayoutStyle } from '~/core/layout-style';

const WatchlistPage = dynamic(
  () => import('~/components/watchlist/watchlistnew'),
  {
    ssr: false,
  },
);

const Watchlist = () => {
  return (
    <RouteShell
      title={<Trans i18nKey={'common:dashboardTabLabel'} />}
      description={<Trans i18nKey={'common:dashboardTabDescription'} />}
    >
      <WatchlistPage />
    </RouteShell>
  );
};

export default Watchlist;

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  return await withAppProps(ctx);
}
