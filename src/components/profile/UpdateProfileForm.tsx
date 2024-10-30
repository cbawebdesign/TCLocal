import { useCallback, useEffect, useState } from 'react';
import { useStorage, useUser } from 'reactfire';
import { Trans, useTranslation } from 'next-i18next';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';

import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
  FirebaseStorage,
} from 'firebase/storage';

import { PhoneAuthProvider, unlink } from 'firebase/auth';

import configuration from '~/configuration';
import { getFirebaseErrorCode } from '~/core/firebase/utils/get-firebase-error-code';
import { useRequestState } from '~/core/hooks/use-request-state';

import { useUpdateProfile } from '~/lib/profile/hooks/use-update-profile';
import LinkPhoneNumberModal from '~/components/profile/accounts/LinkPhoneNumberModal';
import AuthErrorMessage from '~/components/auth/AuthErrorMessage';

import Button from '~/core/ui/Button';
import TextField from '~/core/ui/TextField';
import If from '~/core/ui/If';
import Modal from '~/core/ui/Modal';
import ImageUploader from '~/core/ui/ImageUploader';
import { UserSession } from '~/core/session/types/user-session';

interface ProfileData {
  photoURL?: string | null;
  displayName?: string | null;
  phoneNumber?: string | null;
}

function UpdateProfileForm({
  userSession,
  onUpdate,
}: {
  userSession: UserSession;
  onUpdate: (user: ProfileData) => void;
}) {
  const updateProfileMutation = useUpdateProfile();

  const [displayUpdatePhoneNumber, setDisplayUpdatePhoneNumber] =
    useState(false);

  const { t } = useTranslation();

  const authData = userSession.auth;
  const userId = authData?.uid as string;

  const currentPhotoURL = authData?.photoURL ?? '';
  const currentDisplayName = authData?.displayName ?? '';
  const currentPhoneNumber = authData?.phoneNumber ?? '';
  const userEmail = authData?.email ?? '';

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      displayName: currentDisplayName,
    },
  });

  const onSubmit = async (displayName: string) => {
    const info = {
      displayName,
    };

    const promise = updateProfileMutation.trigger(info).then(() => {
      onUpdate(info);
    });

    return toast.promise(promise, {
      success: t(`profile:updateProfileSuccess`),
      error: t(`profile:updateProfileError`),
      loading: t(`profile:updateProfileLoading`),
    });
  };

  const displayNameControl = register('displayName', {
    value: currentDisplayName,
  });

  useEffect(() => {
    reset({
      displayName: currentDisplayName ?? '',
    });
  }, [currentDisplayName, currentPhotoURL, reset]);

  return (
    <div className={'flex flex-col space-y-8'}>
      <UploadProfileAvatarForm
        currentPhotoURL={currentPhotoURL}
        userId={userId}
        onAvatarUpdated={(photoURL) => {
          return onUpdate({
            photoURL,
          });
        }}
      />

      <form
        data-cy={'update-profile-form'}
        onSubmit={handleSubmit((value) => {
          return onSubmit(value.displayName);
        })}
      >
        <div className={'flex flex-col space-y-4'}>
          <TextField>
            <TextField.Label>
              <Trans i18nKey={'profile:displayNameLabel'} />

              <TextField.Input
                {...displayNameControl}
                data-cy={'profile-display-name'}
                minLength={2}
                placeholder={''}
              />
            </TextField.Label>
          </TextField>

          <TextField>
            <TextField.Label>
              <Trans i18nKey={'profile:emailLabel'} />

              <TextField.Input disabled value={userEmail} />
            </TextField.Label>

            <If condition={userEmail}>
              <div>
                <Button
                  type={'button'}
                  variant={'ghost'}
                  size={'small'}
                  href={configuration.paths.settings.email}
                >
                  <span className={'text-xs font-normal'}>
                    <Trans i18nKey={'profile:updateEmailSubmitLabel'} />
                  </span>
                </Button>
              </div>
            </If>

            <If condition={!userEmail}>
              <div>
                <Button
                  type={'button'}
                  variant={'ghost'}
                  size={'small'}
                  href={configuration.paths.settings.authentication}
                >
                  <span className={'text-xs font-normal'}>
                    <Trans i18nKey={'profile:addEmailAddress'} />
                  </span>
                </Button>
              </div>
            </If>
          </TextField>

          <TextField>
            <TextField.Label>
              <Trans i18nKey={'profile:phoneNumberLabel'} />

              <TextField.Input disabled value={currentPhoneNumber} />
            </TextField.Label>

            {/* Only show this if phone number is enabled */}
            <If condition={configuration.auth.providers.phoneNumber}>
              <div>
                <If
                  condition={!currentPhoneNumber}
                  fallback={
                    <RemovePhoneNumberButton
                      onSuccess={() => {
                        onUpdate({
                          phoneNumber: null,
                        });
                      }}
                    />
                  }
                >
                  <AddPhoneNumberButton
                    onClick={() => setDisplayUpdatePhoneNumber(true)}
                  />
                </If>
              </div>
            </If>
          </TextField>

          <div>
            <Button
              className={'w-full md:w-auto'}
              loading={updateProfileMutation.isMutating}
            >
              <Trans i18nKey={'profile:updateProfileSubmitLabel'} />
            </Button>
          </div>
        </div>
      </form>

      <If condition={displayUpdatePhoneNumber}>
        <LinkPhoneNumberModal
          isOpen={true}
          setIsOpen={setDisplayUpdatePhoneNumber}
          onSuccess={(phoneNumber) => {
            onUpdate({
              phoneNumber,
            });
          }}
        />
      </If>
    </div>
  );
}

function UploadProfileAvatarForm(props: {
  currentPhotoURL: string | null;
  userId: string;
  onAvatarUpdated: (url: string | null) => void;
}) {
  const storage = useStorage();
  const { t } = useTranslation('profile');
  const updateProfileMutation = useUpdateProfile();

  const createToaster = useCallback(
    (promise: Promise<unknown>) => {
      return toast.promise(promise, {
        success: t(`updateProfileSuccess`),
        error: t(`updateProfileError`),
        loading: t(`updateProfileLoading`),
      });
    },
    [t],
  );

  const onValueChange = useCallback(
    async (file: File | null) => {
      const removeExistingStorageFile = async () => {
        if (props.currentPhotoURL) {
          const reference = ref(storage, props.currentPhotoURL);

          return await deleteObject(reference);
        }

        return Promise.resolve();
      };

      if (file) {
        await removeExistingStorageFile();

        const promise = uploadUserProfilePhoto(
          storage,
          file,
          props.userId,
        ).then((photoUrl) => {
          props.onAvatarUpdated(photoUrl);

          return updateProfileMutation.trigger({
            photoURL: photoUrl,
          });
        });

        createToaster(promise);
      } else {
        const promise = removeExistingStorageFile().finally(() => {
          props.onAvatarUpdated('');

          return updateProfileMutation.trigger({
            photoURL: '',
          });
        });

        createToaster(promise);
      }
    },
    [createToaster, props, storage, updateProfileMutation],
  );

  return (
    <ImageUploader value={props.currentPhotoURL} onValueChange={onValueChange}>
      <div className={'flex flex-col space-y-1'}>
        <span className={'text-sm'}>
          <Trans i18nKey={'profile:profilePictureHeading'} />
        </span>

        <span className={'text-xs'}>
          <Trans i18nKey={'profile:profilePictureSubheading'} />
        </span>
      </div>
    </ImageUploader>
  );
}

async function uploadUserProfilePhoto(
  storage: FirebaseStorage,
  photoFile: File,
  userId: string,
) {
  const url = `/profiles/${userId}/${photoFile.name}`;
  const bytes = await photoFile.arrayBuffer();
  const fileRef = ref(storage, url);

  await uploadBytes(fileRef, bytes, {
    contentType: photoFile.type,
  });

  return getDownloadURL(fileRef);
}

function RemovePhoneNumberButton({
  onSuccess,
}: React.PropsWithChildren<{
  onSuccess: () => void;
}>) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: user } = useUser();
  const requestState = useRequestState();
  const { t } = useTranslation();

  const onUnlinkPhoneNumber = useCallback(() => {
    if (!user) {
      throw new Error(`User is not logged in`);
    }

    const promise = unlink(user, PhoneAuthProvider.PROVIDER_ID)
      .then(() => {
        setIsModalOpen(false);
        onSuccess();
      })
      .catch((error) => {
        requestState.setError(error);

        throw getFirebaseErrorCode(error);
      });

    requestState.setLoading(true);

    return toast.promise(promise, {
      loading: t(`profile:unlinkActionLoading`),
      success: t(`profile:unlinkActionSuccess`),
      error: t(`profile:unlinkActionError`),
    });
  }, [user, requestState, t, onSuccess]);

  return (
    <>
      <Button
        type={'button'}
        variant={'ghost'}
        size={'small'}
        onClick={() => setIsModalOpen(true)}
      >
        <span className={'text-xs font-normal'}>
          <Trans i18nKey={'profile:removePhoneNumber'} />
        </span>
      </Button>

      <Modal
        heading={<Trans i18nKey={'profile:removePhoneNumber'} />}
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
      >
        <div className={'flex flex-col space-y-3'}>
          <div>
            <Trans i18nKey={'profile:confirmRemovePhoneNumberDescription'} />
          </div>

          <div>
            <Trans i18nKey={'common:modalConfirmationQuestion'} />
          </div>

          <If condition={requestState.state.error}>
            {(error) => <AuthErrorMessage error={error as string} />}
          </If>

          <Button
            block
            loading={requestState.state.loading}
            variant={'destructive'}
            onClick={onUnlinkPhoneNumber}
          >
            <Trans i18nKey={'profile:confirmRemovePhoneNumber'} />
          </Button>
        </div>
      </Modal>
    </>
  );
}

function AddPhoneNumberButton(
  props: React.PropsWithChildren<{
    onClick: EmptyCallback;
  }>,
) {
  return (
    <Button
      type={'button'}
      variant={'ghost'}
      size={'small'}
      onClick={props.onClick}
    >
      <span className={'text-xs font-normal'}>
        <Trans i18nKey={'profile:addPhoneNumber'} />
      </span>
    </Button>
  );
}

export default UpdateProfileForm;
