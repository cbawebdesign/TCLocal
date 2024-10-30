import type { User } from 'firebase/auth';
import useSWRMutation from 'swr/mutation';

import { useCreateSession } from '~/core/hooks/use-create-session';

/**
 * @name useCreateServerSideSession
 * @description A hook to create a session on the server-side to make
 * authentication work with SSR.
 */
function useCreateServerSideSession() {
  const { trigger } = useCreateSession();

  return useSWRMutation(
    ['create-session'],
    async (
      _,
      {
        arg: user,
      }: {
        arg: User;
      },
    ) => {
      const idToken = await user.getIdToken(true);

      return trigger({ idToken });
    },
  );
}

export default useCreateServerSideSession;
