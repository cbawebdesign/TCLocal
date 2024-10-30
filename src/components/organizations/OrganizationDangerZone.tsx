import useSWRMutation from 'swr/mutation';
import { useRouter } from 'next/router';
import { Trans } from 'next-i18next';

import { useApiRequest } from '~/core/hooks/use-api';

import Button from '~/core/ui/Button';
import Modal from '~/core/ui/Modal';
import If from '~/core/ui/If';
import Heading from '~/core/ui/Heading';

import {
  TextFieldHint,
  TextFieldInput,
  TextFieldLabel,
} from '~/core/ui/TextField';

import { useCurrentUserRole } from '~/lib/organizations/hooks/use-current-user-role';
import { MembershipRole } from '~/lib/organizations/types/membership-role';
import { useCurrentOrganization } from '~/lib/organizations/hooks/use-current-organization';

export function OrganizationDangerZone() {
  const useRole = useCurrentUserRole();
  const isOwner = useRole === MembershipRole.Owner;

  return (
    <>
      <If condition={isOwner}>
        <DeleteOrganizationContainer />
      </If>

      <If condition={!isOwner}>
        <LeaveOrganizationContainer />
      </If>
    </>
  );
}

function DeleteOrganizationContainer() {
  const organization = useCurrentOrganization();

  return (
    <div className={'flex flex-col space-y-4'}>
      <div className={'flex flex-col space-y-1'}>
        <Heading type={6}>
          <Trans i18nKey={'organization:deleteOrganization'} />
        </Heading>

        <p className={'text-gray-500 text-sm'}>
          <Trans
            i18nKey={'organization:deleteOrganizationDescription'}
            values={{
              organizationName: organization?.name,
            }}
          />
        </p>
      </div>

      <div>
        <Modal
          heading={<Trans i18nKey={'organization:deletingOrganization'} />}
          Trigger={
            <Button
              data-cy={'delete-organization-button'}
              type={'button'}
              variant={'destructive'}
            >
              <Trans i18nKey={'organization:deleteOrganization'} />
            </Button>
          }
        >
          <If condition={organization}>
            {({ name, id }) => (
              <DeleteOrganizationForm organization={{ name, id }} />
            )}
          </If>
        </Modal>
      </div>
    </div>
  );
}

function DeleteOrganizationForm({
  organization,
}: {
  organization: { id: string; name: string };
}) {
  const deleteOrganizationMutation = useDeleteOrganization();

  return (
    <form
      className={'flex flex-col space-y-4'}
      onSubmit={(event) => {
        event.preventDefault();
        deleteOrganizationMutation.trigger(organization.id);
      }}
    >
      <div className={'flex flex-col space-y-4'}>
        <div
          className={
            'border-2 border-red-500 p-4 text-sm text-red-500' +
            ' flex flex-col space-y-2'
          }
        >
          <div>
            <Trans
              i18nKey={'organization:deleteOrganizationDisclaimer'}
              values={{
                organizationName: organization?.name,
              }}
            />
          </div>

          <div className={'text-sm'}>
            <Trans i18nKey={'common:modalConfirmationQuestion'} />
          </div>
        </div>

        <TextFieldLabel>
          <Trans i18nKey={'organization:organizationNameInputLabel'} />

          <TextFieldInput
            name={'name'}
            data-cy={'delete-organization-input-field'}
            required
            type={'text'}
            className={'w-full'}
            placeholder={''}
            pattern={organization?.name}
          />

          <TextFieldHint>
            <Trans i18nKey={'organization:deleteOrganizationInputField'} />
          </TextFieldHint>
        </TextFieldLabel>
      </div>

      <div className={'flex justify-end space-x-2.5'}>
        <Button
          data-cy={'confirm-delete-organization-button'}
          loading={deleteOrganizationMutation.isMutating}
          variant={'destructive'}
        >
          <Trans i18nKey={'organization:deleteOrganization'} />
        </Button>
      </div>
    </form>
  );
}

function LeaveOrganizationContainer() {
  const organization = useCurrentOrganization();
  const leaveOrganizationMutation = useLeaveOrganization();

  return (
    <div className={'flex flex-col space-y-4'}>
      <p>
        <Trans
          i18nKey={'organization:leaveOrganizationDescription'}
          values={{
            organizationName: organization?.name,
          }}
        />
      </p>

      <div>
        <Modal
          heading={
            <Trans i18nKey={'organization:leavingOrganizationModalHeading'} />
          }
          Trigger={
            <Button
              data-cy={'leave-organization-button'}
              type={'button'}
              variant={'destructive'}
            >
              <Trans i18nKey={'organization:leaveOrganization'} />
            </Button>
          }
        >
          <div className={'flex flex-col space-y-6'}>
            <div className={'text-sm'}>
              <Trans
                i18nKey={'organization:leaveOrganizationDisclaimer'}
                values={{
                  organizationName: organization?.name,
                }}
              />
            </div>

            <div className={'text-sm'}>
              <Trans i18nKey={'common:modalConfirmationQuestion'} />
            </div>

            <div className={'flex justify-end space-x-2.5'}>
              <Button
                data-cy={'confirm-leave-organization-button'}
                loading={leaveOrganizationMutation.isMutating}
                variant={'destructive'}
                onClick={() => {
                  if (!organization) {
                    return null;
                  }

                  leaveOrganizationMutation.trigger(organization.id);
                }}
              >
                <Trans i18nKey={'organization:leaveOrganization'} />
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}

function useDeleteOrganization() {
  const fetcher = useApiRequest();
  const router = useRouter();

  const mutationFn = (_: unknown, { arg }: { arg: string }) => {
    const path = `/api/organizations/${arg}/delete`;

    return fetcher({
      path,
      method: 'POST',
    });
  };

  return useSWRMutation('delete-organization', mutationFn, {
    onSuccess: () => {
      return router.replace('/dashboard');
    },
  });
}

function useLeaveOrganization() {
  const fetcher = useApiRequest();
  const router = useRouter();

  const mutationFn = (_: unknown, { arg }: { arg: string }) => {
    const path = `/api/organizations/${arg}/leave`;

    return fetcher({
      path,
      method: 'POST',
    });
  };

  return useSWRMutation('leave-organization', mutationFn, {
    onSuccess: () => {
      router.reload();
    },
  });
}
