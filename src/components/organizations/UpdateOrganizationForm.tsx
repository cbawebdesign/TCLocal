import { useCallback, useContext, useEffect } from 'react';
import { toast } from 'sonner';
import { useStorage } from 'reactfire';
import { Trans, useTranslation } from 'next-i18next';
import { useForm } from 'react-hook-form';

import {
  deleteObject,
  FirebaseStorage,
  getDownloadURL,
  ref,
  uploadBytes,
} from 'firebase/storage';

import { OrganizationContext } from '~/lib/contexts/organization';
import { useUpdateOrganization } from '~/lib/organizations/hooks/use-update-organization';

import Button from '~/core/ui/Button';
import TextField from '~/core/ui/TextField';
import ImageUploader from '~/core/ui/ImageUploader';

const UpdateOrganizationForm = () => {
  const { organization, setOrganization } = useContext(OrganizationContext);
  const updateOrganizationMutation = useUpdateOrganization();
  const { t } = useTranslation('organization');

  const currentOrganizationName = organization?.name ?? '';
  const currentLogoUrl = organization?.logoURL || null;

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      name: currentOrganizationName,
    },
  });

  const onSubmit = useCallback(
    async ({ name }: { name: string }) => {
      const organizationId = organization?.id;

      if (!organizationId) {
        return toast.error(t(`updateOrganizationErrorMessage`));
      }

      const promise = updateOrganizationMutation
        .trigger({ name, id: organizationId })
        .then(() => {
          setOrganization({
            ...organization,
            name,
          });
        });

      toast.promise(promise, {
        loading: t(`updateOrganizationLoadingMessage`),
        success: t(`updateOrganizationSuccessMessage`),
        error: t(`updateOrganizationErrorMessage`),
      });
    },
    [organization, setOrganization, t, updateOrganizationMutation],
  );

  useEffect(() => {
    reset({
      name: organization?.name,
    });
  }, [organization, reset]);

  const nameControl = register('name', {
    required: true,
  });

  if (!organization) {
    return null;
  }

  return (
    <div className={'flex flex-col space-y-8'}>
      <UploadLogoForm
        organizationId={organization.id}
        currentLogoUrl={currentLogoUrl}
        onLogoUpdated={(logoURL) => {
          setOrganization({
            ...organization,
            logoURL,
          });
        }}
      />

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className={'flex flex-col space-y-4'}>
          <TextField.Label>
            <Trans i18nKey={'organization:organizationNameInputLabel'} />

            <TextField.Input
              {...nameControl}
              data-cy={'organization-name-input'}
              required
              placeholder={'ex. IndieCorp'}
            />
          </TextField.Label>

          <div>
            <Button
              className={'w-full md:w-auto'}
              data-cy={'update-organization-submit-button'}
              loading={updateOrganizationMutation.isMutating}
            >
              <Trans i18nKey={'organization:updateOrganizationSubmitLabel'} />
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

function UploadLogoForm(props: {
  currentLogoUrl: string | null | undefined;
  organizationId: string;
  onLogoUpdated: (url: string | null) => void;
}) {
  const storage = useStorage();
  const updateOrganizatioMutation = useUpdateOrganization();
  const { t } = useTranslation('organization');

  const createToaster = useCallback(
    (promise: Promise<unknown>) => {
      return toast.promise(promise, {
        loading: t(`updateOrganizationLoadingMessage`),
        success: t(`updateOrganizationSuccessMessage`),
        error: t(`updateOrganizationErrorMessage`),
      });
    },
    [t],
  );

  const onValueChange = useCallback(
    async (file: File | null) => {
      const removeExistingStorageFile = () => {
        if (props.currentLogoUrl) {
          const reference = ref(storage, props.currentLogoUrl);

          return deleteObject(reference);
        }

        return Promise.resolve();
      };

      if (file) {
        await removeExistingStorageFile();

        const promise = uploadLogo({
          storage,
          organizationId: props.organizationId,
          logo: file,
        }).then(async (logoURL) => {
          await updateOrganizatioMutation.trigger({
            logoURL,
            id: props.organizationId,
          });

          props.onLogoUpdated(logoURL);
        });

        createToaster(promise);
      } else {
        if (props.currentLogoUrl) {
          const promise = removeExistingStorageFile().then(async () => {
            await updateOrganizatioMutation.trigger({
              logoURL: '',
              id: props.organizationId,
            });

            props.onLogoUpdated(null);
          });

          createToaster(promise);
        }
      }
    },
    [createToaster, props, storage, updateOrganizatioMutation],
  );

  return (
    <ImageUploader value={props.currentLogoUrl} onValueChange={onValueChange}>
      <div className={'flex flex-col space-y-1'}>
        <span className={'text-sm'}>
          <Trans i18nKey={'organization:organizationLogoInputHeading'} />
        </span>

        <span className={'text-xs'}>
          <Trans i18nKey={'organization:organizationLogoInputSubheading'} />
        </span>
      </div>
    </ImageUploader>
  );
}

async function uploadLogo({
  storage,
  organizationId,
  logo,
}: {
  storage: FirebaseStorage;
  organizationId: string;
  logo: File;
}) {
  const path = getLogoStoragePath(organizationId, logo.name);
  const bytes = await logo.arrayBuffer();
  const fileRef = ref(storage, path);

  // first, we upload the logo to Firebase Storage
  await uploadBytes(fileRef, bytes, {
    contentType: logo.type,
  });

  // now we can get the download URL from its reference
  return await getDownloadURL(fileRef);
}

function getLogoStoragePath(organizationId: string, fileName: string) {
  return [`/organizations`, organizationId, fileName].join('/');
}

export default UpdateOrganizationForm;
