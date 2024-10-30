import useSWRMutation from 'swr/mutation';
import { useRouter } from 'next/router';

import { useApiRequest } from '~/core/hooks/use-api';

import Modal from '~/core/ui/Modal';
import Button from '~/core/ui/Button';
import { TextFieldInput, TextFieldLabel } from '~/core/ui/TextField';

export function DeleteUserModal({
  userId,
  displayName,
  children,
}: React.PropsWithChildren<{
  userId: string;
  displayName: string;
}>) {
  const mutation = useDeleteUser(userId);

  return (
    <Modal heading={'Deleting User'} Trigger={children}>
      <form
        onSubmit={() => {
          mutation.trigger();
        }}
      >
        <div className={'flex flex-col space-y-4'}>
          <div className={'flex flex-col space-y-2 text-sm'}>
            <p>
              You are about to delete the user <b>{displayName}</b>.
            </p>

            <p>
              Delete this user will also delete all the organizations the user
              is an Owner of.
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
              Yes, delete user
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}

function useDeleteUser(userId: string) {
  const key = `/api/admin/users/${userId}/delete`;
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
