import { GetServerSidePropsContext } from 'next';
import Head from 'next/head';
import { Trans, useTranslation } from 'next-i18next';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

import { withAppProps } from '~/lib/props/with-app-props';

import OrganizationSettingsTabs from '~/components/organizations/OrganizationSettingsTabs';
import SettingsPageContainer from '~/components/settings/SettingsPageContainer';
import SettingsContentContainer from '~/components/settings/SettingsContentContainer';

import Button from '~/core/ui/Button';
import SettingsTile from '~/components/settings/SettingsTile';
import InviteMembersFormContainer from '~/components/organizations/InviteMembersFormContainer';

const OrganizationMembersInvitePage = () => {
  const { t } = useTranslation();

  return (
    <SettingsPageContainer title={t('common:settingsTabLabel')}>
      <PageTitle />

      <OrganizationSettingsTabs />

      <SettingsContentContainer>
        <SettingsTile
          heading={<Trans i18nKey={'organization:inviteMembersPageHeading'} />}
          subHeading={
            <Trans i18nKey={'organization:inviteMembersPageSubheading'} />
          }
        >
          <InviteMembersFormContainer />
        </SettingsTile>

        <div className={'mt-4'}>
          <GoBackToMembersButton />
        </div>
      </SettingsContentContainer>
    </SettingsPageContainer>
  );
};

export default OrganizationMembersInvitePage;

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  return await withAppProps(ctx);
}

function GoBackToMembersButton() {
  return (
    <Button
      size={'small'}
      variant={'ghost'}
      href={'/settings/organization/members'}
    >
      <span className={'flex items-center space-x-1'}>
        <ArrowLeftIcon className={'h-3'} />

        <span>
          <Trans i18nKey={'organization:goBackToMembersPage'} />
        </span>
      </span>
    </Button>
  );
}

function PageTitle() {
  const { t } = useTranslation();

  return (
    <Head>
      <title key="title">
        {`${t('organization:membersTabLabel')} - ${t(
          'common:settingsTabLabel',
        )}`}
      </title>
    </Head>
  );
}
