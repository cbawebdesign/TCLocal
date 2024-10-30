import { useCallback } from 'react';
import { GetServerSidePropsContext } from 'next';
import { useForm } from 'react-hook-form';

import configuration from '~/configuration';
import { withUserProps } from '~/lib/props/with-user-props';
import If from '~/core/ui/If';
import Stepper from '~/core/ui/Stepper';

import { CompleteOnboardingStep } from '~/components/onboarding/CompleteOnboardingStep';

import {
  OrganizationInfoStep,
  OrganizationInfoStepData
} from '~/components/onboarding/OrganizationInfoStep';

import { withTranslationProps } from '~/lib/props/with-translation-props';
import { OnboardingLayout } from '~/components/onboarding/OnboardingLayout';
import { MembershipRole } from '~/lib/organizations/types/membership-role';
import OrganizationInvitesStep from '~/components/onboarding/OrganizationInvitesStep';
import { getLoggedInUser } from '~/core/firebase/admin/auth/get-logged-in-user';

type Invite = {
  email: string;
  role: MembershipRole;
};

/**
 * Represents the list of steps for a user onboarding process.
 * The Array represents the list of step names to render within
 * the Stepper component. You can either use the i18n key or the label itself.
 *
 * Update this array to add/remove steps from the onboarding process.
 *
 * @type {Array<string>}
 */
const STEPS: Array<string> = [
  'onboarding:info',
  'onboarding:invites',
  'onboarding:complete'
];

const Onboarding = () => {
  const form = useForm({
    defaultValues: {
      data: {
        organization: '',
        invites: [] as Invite[]
      },
      currentStep: 0
    }
  });

  const nextStep = useCallback(() => {
    form.setValue('currentStep', form.getValues('currentStep') + 1);
  }, [form]);

  const onInfoStepSubmitted = useCallback(
    (organizationInfo: OrganizationInfoStepData) => {
      form.setValue('data.organization', organizationInfo.organization);
      nextStep();
    },
    [form, nextStep]
  );

  const onInvitesStepSubmitted = useCallback(
    (invites: Invite[]) => {
      form.setValue('data.invites', invites);
      form.setValue('currentStep', form.getValues('currentStep') + 1);
    },
    [form]
  );

  const currentStep = form.watch('currentStep');
  const formData = form.watch('data');

  const isStep = useCallback(
    (step: number) => currentStep === step,
    [currentStep]
  );

  return (
    <OnboardingLayout>
      <Stepper steps={STEPS} currentStep={currentStep} />

      <If condition={isStep(0)}>
        <OrganizationInfoStep onSubmit={onInfoStepSubmitted} />
      </If>

      <If condition={isStep(1)}>
        <OrganizationInvitesStep onSubmit={onInvitesStepSubmitted} />
      </If>

      <If condition={isStep(2) && formData}>
        {(data) => <CompleteOnboardingStep data={data} />}
      </If>
    </OnboardingLayout>
  );
};

export default Onboarding;

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const { props } = await withUserProps(ctx);
  const user = await getLoggedInUser(ctx);

  if (!user) {
    return redirectToSignIn();
  }

  const isEmailVerified = user.email_verified;
  const requireEmailVerification = configuration.auth.requireEmailVerification;
  const signInProvider = user.firebase.sign_in_provider;

  const userHasProviderWithEmailVerification =
    signInProvider === 'password';

  // verify if the user has an email/password provider linked to their account
  if (userHasProviderWithEmailVerification) {
    if (requireEmailVerification && !isEmailVerified) {
      return redirectToSignIn();
    }
  }

  const userData = await getUserData(user.uid);
  const translationProps = await withTranslationProps(ctx);

  // if we cannot find the user's Firestore record
  // the user should go to the onboarding flow
  // so that the record wil be created after the end of the flow
  if (!userData) {
    return {
      ...translationProps,
      props
    };
  }

  const { getCurrentOrganization } = await import(
    '~/lib/server/organizations/get-current-organization'
    );

  const organization = await getCurrentOrganization(user.uid);
  const onboarded = user.customClaims?.onboarded;

  if (onboarded && organization) {
    return redirectToAppHome(ctx.locale);
  }

  return {
    ...translationProps,
    props
  };
}

function redirectToSignIn() {
  const paths = configuration.paths;

  const destination = [
    paths.signIn,
    `?returnUrl=${paths.onboarding}&signOut=true`
  ].join('/');

  return {
    redirect: {
      destination,
      permanent: false
    }
  };
}

function redirectToAppHome(locale: string | undefined) {
  const localePrefix = locale ? `/${locale}` : '';
  const destination = `${localePrefix}${configuration.paths.appHome}`;

  return {
    redirect: {
      destination,
      permanent: false
    }
  };
}

/**
 * @name getUserData
 * @description Fetch User Firestore data decorated with its ID field
 * @param userId
 */
async function getUserData(userId: string) {
  const { getUserRefById } = await import('~/lib/server/queries');

  const ref = await getUserRefById(userId);
  const data = ref.data();

  if (data) {
    return {
      ...data,
      id: ref.id
    };
  }
}
