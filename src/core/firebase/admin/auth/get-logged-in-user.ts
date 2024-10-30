import {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from 'next';

import { parseCookies } from 'nookies';

type Context = {
  req: NextApiRequest;
  res: NextApiResponse;
};

/**
 * @description Get the logged in user object using the session cookie
 * @param ctx
 * @param checkRevoked
 */
export async function getLoggedInUser(
  ctx: Context | GetServerSidePropsContext,
  checkRevoked = false,
) {
  const { session } = parseCookies(ctx);

  if (!session) {
    return Promise.reject(`Tried parsing session cookie - but it was empty.`);
  }

  const { getUserFromSessionCookie } = await import(
    './get-user-from-session-cookie'
  );

  return getUserFromSessionCookie(session, checkRevoked);
}
