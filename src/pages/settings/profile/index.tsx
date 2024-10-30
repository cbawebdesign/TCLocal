import { useCallback, useContext } from 'react';
import { GetServerSidePropsContext } from 'next';
import { Trans, useTranslation } from 'next-i18next';
import { UserInfo } from 'firebase/auth';
import { useUser } from 'reactfire';
import Head from 'next/head';

import FirebaseStorageProvider from '~/core/firebase/components/FirebaseStorageProvider';

import { withAppProps } from '~/lib/props/with-app-props';
import { UserSessionContext } from '~/core/contexts/user-session';

import UpdateProfileForm from '~/components/profile/UpdateProfileForm';
import ProfileSettingsTabs from '~/components/profile/ProfileSettingsTabs';
import SettingsPageContainer from '~/components/settings/SettingsPageContainer';
import SettingsContentContainer from '~/components/settings/SettingsContentContainer';
import SettingsTile from '~/components/settings/SettingsTile';
import { ProfileDangerZone } from '~/components/profile/ProfileDangerZone';
import If from '~/core/ui/If';
import configuration from '~/configuration';

type ProfileData = Partial<UserInfo>;

const Profile = () => {
  const { userSession, setUserSession } = useContext(UserSessionContext);
  const { data: user } = useUser();
  const { t } = useTranslation();

  const onUpdate = useCallback(
    (data: ProfileData) => {
      const authData = userSession?.auth;

      if (authData) {
        setUserSession({
          auth: {
            ...authData,
            ...data,
          },
          data: userSession.data,
        });
      }
    },
    [setUserSession, userSession],
  );

  if (!user) {
    return null;
  }

  return (
    <SettingsPageContainer title={t('common:settingsTabLabel')}>
      <Head>
        <title key={'title'}>{t('profile:generalTab')}</title>
      </Head>

      <ProfileSettingsTabs />

      <SettingsContentContainer>
        <div className={'flex flex-col space-y-8 pb-48'}>
          <SettingsTile
            heading={<Trans i18nKey={'profile:generalTab'} />}
            subHeading={<Trans i18nKey={'profile:generalTabSubheading'} />}
          >
            <If condition={userSession}>
              {(session) => (
                <FirebaseStorageProvider>
                  <UpdateProfileForm
                    userSession={session}
                    onUpdate={onUpdate}
                  />
                </FirebaseStorageProvider>
              )}
            </If>
          </SettingsTile>

          <If condition={configuration.features.enableAccountDeletion}>
            <SettingsTile
              heading={<Trans i18nKey={'profile:dangerZone'} />}
              subHeading={<Trans i18nKey={'profile:dangerZoneSubheading'} />}
            >
              <ProfileDangerZone />
            </SettingsTile>
          </If>
        </div>
      </SettingsContentContainer>
    </SettingsPageContainer>
  );
};

export default Profile;

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  return await withAppProps(ctx);
}
