import { useUser } from 'reactfire';
import { updateProfile } from 'firebase/auth';
import useSWRMutation from 'swr/mutation';

type ProfileInfo = Partial<{
  displayName: string | null;
  photoURL: string | null;
}>;

export function useUpdateProfile() {
  const { data: user } = useUser();

  return useSWRMutation(
    ['profile', user?.uid],
    (_, { arg: data }: { arg: ProfileInfo }) => {
      if (!user) {
        throw new Error('User not found');
      }

      return updateProfile(user, data);
    },
  );
}
