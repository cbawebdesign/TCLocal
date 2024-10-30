import { GetServerSidePropsContext } from 'next';
import { Trans, useTranslation } from 'next-i18next';
import Head from 'next/head';
import dynamic from 'next/dynamic';

import { withAppProps } from '~/lib/props/with-app-props';

import OrganizationSettingsTabs from '~/components/organizations/OrganizationSettingsTabs';

import SettingsPageContainer from '~/components/settings/SettingsPageContainer';
import SettingsContentContainer from '~/components/settings/SettingsContentContainer';
import SettingsTile from '~/components/settings/SettingsTile';

import { useCurrentOrganization } from '~/lib/organizations/hooks/use-current-organization';

const OrganizationMembersList = dynamic(
  () => import('~/components/organizations/OrganizationMembersList'),
  {
    ssr: false,
  },
);

const OrganizationMembersPage: React.FCC = () => {
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
          {`${t('organization:membersTabLabel')} - ${t(
            'common:settingsTabLabel',
          )}`}
        </title>
      </Head>

      <OrganizationSettingsTabs />

      <SettingsContentContainer>
        <SettingsTile
          heading={<Trans i18nKey={'organization:membersTabLabel'} />}
          subHeading={<Trans i18nKey={'organization:membersTabSubheading'} />}
        >
          <OrganizationMembersList organizationId={id} />
        </SettingsTile>
      </SettingsContentContainer>
    </SettingsPageContainer>
  );
};

export default OrganizationMembersPage;

export function getServerSideProps(ctx: GetServerSidePropsContext) {
  return withAppProps(ctx);
}
