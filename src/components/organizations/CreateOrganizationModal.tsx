import { FormEvent, useCallback } from 'react';
import { toast } from 'sonner';
import { Trans, useTranslation } from 'next-i18next';

import Modal from '~/core/ui/Modal';
import TextField from '~/core/ui/TextField';
import Button from '~/core/ui/Button';

import { useCreateOrganization } from '~/lib/organizations/hooks/use-create-organization';

const CreateOrganizationModal: React.FCC<{
  onCreate: (organizationId: string) => void;
}> = ({ onCreate, children }) => {
  return (
    <Modal
      Trigger={children}
      heading={
        <Trans i18nKey={'organization:createOrganizationModalHeading'} />
      }
    >
      <Form onCreate={onCreate} />
    </Modal>
  );
};

export default CreateOrganizationModal;

function Form({ onCreate }: { onCreate: (organizationId: string) => void }) {
  const [createOrganization, createOrganizationState] = useCreateOrganization();
  const { loading } = createOrganizationState;
  const { t } = useTranslation();

  const onSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const data = new FormData(event.currentTarget);
      const name = data.get(`name`) as string;

      // Adjust logic for error handling as needed
      const isNameInvalid = !name || name.trim().length <= 1;

      if (isNameInvalid) {
        return toast.error(`Please use a valid name`);
      }

      const promise = createOrganization(name).then((organizationId) => {
        if (organizationId) {
          onCreate(organizationId);
        }
      });

      toast.promise(promise, {
        success: t(`organization:createOrganizationSuccess`),
        error: t(`organization:createOrganizationError`),
        loading: t(`organization:createOrganizationLoading`),
      });
    },
    [createOrganization, onCreate, t],
  );

  return (
    <form onSubmit={onSubmit}>
      <div className={'flex flex-col space-y-6'}>
        <TextField.Label>
          <Trans i18nKey={'organization:organizationNameLabel'} />

          <TextField.Input
            data-cy={'create-organization-name-input'}
            name={'name'}
            required
            placeholder={''}
          />
        </TextField.Label>

        <div className={'flex justify-end space-x-2'}>
          <Button
            data-cy={'confirm-create-organization-button'}
            loading={loading}
          >
            <Trans i18nKey={'organization:createOrganizationSubmitLabel'} />
          </Button>
        </div>
      </div>
    </form>
  );
}
