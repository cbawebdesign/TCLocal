import { Trans, useTranslation } from 'next-i18next';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { GetServerSidePropsContext } from 'next';

import { useCurrentOrganization } from '~/lib/organizations/hooks/use-current-organization';
import OrganizationSettingsTabs from '~/components/organizations/OrganizationSettingsTabs';
import SettingsPageContainer from '~/components/settings/SettingsPageContainer';
import SettingsTile from '~/components/settings/SettingsTile';
import { withAppProps } from '~/lib/props/with-app-props';

const OrganizationInvitedMembersList = dynamic(
  () => import('~/components/organizations/OrganizationInvitedMembersList'),
  {
    ssr: false,
  },
);

const OrganizationInvitesPage = () => {
  const { t } = useTranslation();
  const organization = useCurrentOrganization();
  const id = organization?.id as string;

  if (!id) {
    return null;
  }

  return (
    <SettingsPageContainer title={t('common:settingsTabLabel')}>
      <Head>
        <title key="title">
          {`${t('organization:invitesTabLabel')} - ${t(
            'common:settingsTabLabel',
          )}`}
        </title>
      </Head>

      <OrganizationSettingsTabs />

      <div className={'w-full max-w-4xl'}>
        <SettingsTile
          heading={<Trans i18nKey={'organization:pendingInvitesHeading'} />}
          subHeading={
            <Trans i18nKey={'organization:pendingInvitesSubheading'} />
          }
        >
          <OrganizationInvitedMembersList organizationId={id} />
        </SettingsTile>
      </div>
    </SettingsPageContainer>
  );
};

export default OrganizationInvitesPage;

export function getServerSideProps(ctx: GetServerSidePropsContext) {
  return withAppProps(ctx);
}
