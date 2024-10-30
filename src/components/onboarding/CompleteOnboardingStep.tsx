import { useEffect, useRef } from 'react';
import useSWRMutation from 'swr/mutation';
import { CheckIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { Trans } from 'next-i18next';

import { useApiRequest } from '~/core/hooks/use-api';
import Alert from '~/core/ui/Alert';
import Button from '~/core/ui/Button';
import Heading from '~/core/ui/Heading';
import Spinner from '~/core/ui/Spinner';

import configuration from '~/configuration';

interface CompleteOnboardingStepData {
  organization: string;
  invites: Array<{
    email: string;
    role: number;
  }>;
}

export const CompleteOnboardingStep: React.FCC<{
  data: CompleteOnboardingStepData;
}> = ({ data }) => {
  const { trigger, error, data: response } = useCompleteOnboardingRequest();
  const onboardingCompleteRequested = useRef(false);

  useEffect(() => {
    void (async () => {
      // React will run the effect twice
      // so we use the ref to prevent it
      if (!onboardingCompleteRequested.current) {
        onboardingCompleteRequested.current = true;
        await trigger(data);
      }
    })();
  }, [data, trigger]);

  if (error) {
    return <ErrorState />;
  }

  if (response && response.success) {
    return <SuccessState returnUrl={response.returnUrl} />;
  }

  return (
    <div
      className={
        'flex flex-1 flex-col items-center space-y-8 zoom-in-90 animate-in fade-in ease-out' +
        ' duration-1000 slide-in-from-bottom-8'
      }
    >
      <span>
        <Spinner className={'h-12 w-12'} />
      </span>

      <span>
        <Trans i18nKey={'onboarding:settingAccount'} />
      </span>
    </div>
  );
};

function useCompleteOnboardingRequest() {
  const fetcher = useApiRequest<
    {
      success: boolean;
      returnUrl: string;
    },
    CompleteOnboardingStepData
  >();

  return useSWRMutation(
    '/api/onboarding',
    (path, { arg: body }: { arg: CompleteOnboardingStepData }) => {
      return fetcher({
        path,
        body,
      });
    },
  );
}

function ErrorState() {
  return (
    <Alert type={'error'}>
      <Alert.Heading>
        <Trans i18nKey={'onboarding:errorAlertHeading'} />
      </Alert.Heading>

      <Trans i18nKey={'common:genericError'} />
    </Alert>
  );
}

function SuccessState(props: { returnUrl: string }) {
  const href = props.returnUrl || configuration.paths.appHome;

  return (
    <section
      className={
        'mx-auto rounded-xl lg:p-16 fade-in' +
        ' bg-background animate-in slide-in-from-bottom-16' +
        ' zoom-in-95 duration-1000 ease-out'
      }
    >
      <div
        className={
          'flex flex-col space-y-8 items-center justify-center text-center'
        }
      >
        <CheckIcon
          className={
            'w-16 bg-green-500 p-1 text-white rounded-full ring-8' +
            ' ring-green-500/30 dark:ring-green-500/50'
          }
        />

        <Heading type={3}>
          <span className={'font-semibold mr-4'}>
            <Trans i18nKey={'onboarding:successStepHeading'} />
          </span>
          🎉
        </Heading>

        <Button
          data-cy={'complete-onboarding-link'}
          href={href}
          variant={'outline'}
        >
          <span className={'flex space-x-2.5 items-center'}>
            <span>
              <Trans i18nKey={'onboarding:continue'} />
            </span>

            <ChevronRightIcon className={'h-4'} />
          </span>
        </Button>
      </div>
    </section>
  );
}
