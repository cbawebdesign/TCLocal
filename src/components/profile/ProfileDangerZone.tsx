import { Trans } from 'next-i18next';
import useSWRMutation from 'swr/mutation';

import Modal from '~/core/ui/Modal';
import Button from '~/core/ui/Button';
import Heading from '~/core/ui/Heading';

import { TextFieldInput, TextFieldLabel } from '~/core/ui/TextField';
import { useApiRequest } from '~/core/hooks/use-api';
import Alert from '~/core/ui/Alert';

export function ProfileDangerZone() {
  return <DeleteProfileContainer />;
}

function DeleteProfileContainer() {
  return (
    <div>
      <div className={'flex flex-col space-y-4'}>
        <div className={'flex flex-col space-y-1'}>
          <Heading type={6}>
            <Trans i18nKey={'profile:deleteAccount'} />
          </Heading>

          <p className={'text-gray-500 text-sm'}>
            <Trans i18nKey={'profile:deleteAccountDescription'} />
          </p>
        </div>

        <div>
          <Modal
            heading={<Trans i18nKey={'profile:deleteAccount'} />}
            Trigger={
              <Button data-cy={'delete-account-button'} variant={'destructive'}>
                <Trans i18nKey={'profile:deleteAccount'} />
              </Button>
            }
          >
            <DeleteProfileForm />
          </Modal>
        </div>
      </div>
    </div>
  );
}

function DeleteProfileForm() {
  const deleteAccountMutation = useDeleteAccountMutation();

  if (deleteAccountMutation.error) {
    return (
      <Alert type={'error'}>
        <Alert.Heading>
          <Trans i18nKey={'profile:deleteAccountErrorHeading'} />
        </Alert.Heading>

        <Trans i18nKey={'common:genericError'} />
      </Alert>
    );
  }

  const onAccountDeleteRequested: React.FormEventHandler = (event) => {
    event.preventDefault();

    return deleteAccountMutation.trigger();
  };

  return (
    <form
      className={'flex flex-col space-y-4'}
      onSubmit={onAccountDeleteRequested}
    >
      <div className={'flex flex-col space-y-6'}>
        <div className={'border-2 border-red-500 p-4 text-sm text-red-500'}>
          <div className={'flex flex-col space-y-2'}>
            <div>
              <Trans i18nKey={'profile:deleteAccountDescription'} />
            </div>

            <div>
              <Trans i18nKey={'common:modalConfirmationQuestion'} />
            </div>
          </div>
        </div>

        <TextFieldLabel>
          <Trans i18nKey={'profile:deleteProfileConfirmationInputLabel'} />

          <TextFieldInput
            data-cy={'delete-account-input-field'}
            required
            type={'text'}
            className={'w-full'}
            placeholder={''}
            pattern={`DELETE`}
          />
        </TextFieldLabel>
      </div>

      <div className={'flex justify-end space-x-2.5'}>
        <Button
          data-cy={'confirm-delete-account-button'}
          loading={deleteAccountMutation.isMutating}
          variant={'destructive'}
        >
          <Trans i18nKey={'profile:deleteAccount'} />
        </Button>
      </div>
    </form>
  );
}

function useDeleteAccountMutation() {
  const fetcher = useApiRequest();

  return useSWRMutation(
    ['delete-account'],
    async () => {
      return fetcher({
        path: `/api/user`,
        method: 'DELETE',
      });
    },
    {
      onSuccess: () => {
        window.location.assign('/');
      },
    },
  );
}
