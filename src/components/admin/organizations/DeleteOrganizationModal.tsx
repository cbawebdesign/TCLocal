import useSWRMutation from 'swr/mutation';
import { useRouter } from 'next/router';

import { useApiRequest } from '~/core/hooks/use-api';
import { Organization } from '~/lib/organizations/types/organization';

import Modal from '~/core/ui/Modal';
import Button from '~/core/ui/Button';
import { TextFieldInput, TextFieldLabel } from '~/core/ui/TextField';

export function DeleteOrganizationModal({
  organization,
  children,
}: React.PropsWithChildren<{
  organization: WithId<Organization>;
}>) {
  const mutation = useDeleteOrganization(organization.id);

  return (
    <Modal heading={'Deleting Organization'} Trigger={children}>
      <form
        onSubmit={() => {
          mutation.trigger();
        }}
      >
        <div className={'flex flex-col space-y-4'}>
          <div className={'flex flex-col space-y-2 text-sm'}>
            <p>
              You are about to delete the organization{' '}
              <b>{organization.name}</b>.
            </p>

            <p>
              Delete this organization will potentially delete the data
              associated with it.
            </p>

            <p>
              <b>This action is not reversible</b>.
            </p>

            <p>Are you sure you want to do this?</p>
          </div>

          <div>
            <TextFieldLabel>
              Confirm by typing <b>DELETE</b>
              <TextFieldInput required type={'text'} pattern={'DELETE'} />
            </TextFieldLabel>
          </div>

          <div className={'flex space-x-2.5 justify-end'}>
            <Button loading={mutation.isMutating} variant={'destructive'}>
              Yes, delete organization
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}

function useDeleteOrganization(organizationId: string) {
  const key = `/api/admin/organizations/${organizationId}/delete`;
  const fetcher = useApiRequest();
  const router = useRouter();

  return useSWRMutation(
    key,
    (path) => {
      return fetcher({
        path,
        method: 'POST',
      });
    },
    {
      onSuccess: () => {
        router.reload();
      },
    },
  );
}
