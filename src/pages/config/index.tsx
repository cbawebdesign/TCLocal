import { GetServerSidePropsContext } from 'next';
import dynamic from 'next/dynamic';
import { Trans } from 'next-i18next';

import { withAppProps } from '~/lib/props/with-app-props';
import RouteShell from '~/components/RouteShell';
import { LayoutStyle } from '~/core/layout-style';

const ConfigPage = dynamic(
  () => import('~/components/config/config'),
  {
    ssr: false,
  },
);

const Config = () => {
  return (
    <RouteShell
      title={<Trans i18nKey={'common:dashboardTabLabel'} />}
      description={<Trans i18nKey={'common:dashboardTabDescription'} />}
    >
      <ConfigPage />
    </RouteShell>
  );
};

export default Config;

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  return await withAppProps(ctx);
}
