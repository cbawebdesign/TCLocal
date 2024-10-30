import { GetServerSidePropsContext } from 'next';
import { Trans, useTranslation } from 'next-i18next';
import Head from 'next/head';

import { withAppProps } from '~/lib/props/with-app-props';

import FirebaseStorageProvider from '~/core/firebase/components/FirebaseStorageProvider';
import UpdateOrganizationForm from '~/components/organizations/UpdateOrganizationForm';
import OrganizationSettingsTabs from '~/components/organizations/OrganizationSettingsTabs';
import SettingsPageContainer from '~/components/settings/SettingsPageContainer';
import SettingsContentContainer from '~/components/settings/SettingsContentContainer';
import SettingsTile from '~/components/settings/SettingsTile';
import { OrganizationDangerZone } from '~/components/organizations/OrganizationDangerZone';
import If from '~/core/ui/If';
import configuration from '~/configuration';

const Organization = () => {
  const { t } = useTranslation();

  return (
    <SettingsPageContainer title={t('common:settingsTabLabel')}>
      <Head>
        <title key="title">
          {t('organization:generalTabLabel')} - {t('common:settingsTabLabel')}
        </title>
      </Head>

      <OrganizationSettingsTabs />

      <SettingsContentContainer>
        <div className={'flex flex-col space-y-8'}>
          <SettingsTile
            heading={<Trans i18nKey={'organization:generalTabLabel'} />}
            subHeading={
              <Trans i18nKey={'organization:generalTabLabelSubheading'} />
            }
          >
            <FirebaseStorageProvider>
              <UpdateOrganizationForm />
            </FirebaseStorageProvider>
          </SettingsTile>

          <If condition={configuration.features.enableOrganizationDeletion}>
            <SettingsTile
              heading={<Trans i18nKey={'organization:dangerZone'} />}
              subHeading={
                <Trans i18nKey={'organization:dangerZoneSubheading'} />
              }
            >
              <OrganizationDangerZone />
            </SettingsTile>
          </If>
        </div>
      </SettingsContentContainer>
    </SettingsPageContainer>
  );
};

export default Organization;

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  return await withAppProps(ctx);
}
