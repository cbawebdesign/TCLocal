import { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from 'firebase-admin/auth';
import { withAdmin as withFirebaseAdmin } from '~/core/middleware/with-admin';
import { isSuperAdmin } from '~/lib/admin/utils/is-super-admin';
import { throwUnauthorizedException } from '~/core/http-exceptions';
import withCsrf from '~/core/middleware/with-csrf';
import { deleteUser } from '~/lib/server/users/delete-user';

export default async function deleteUserHandler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await withFirebaseAdmin();
  await withCsrf()(req);

  const isAdmin = await isSuperAdmin({ req, res });

  if (!isAdmin) {
    return throwUnauthorizedException();
  }

  const userId = req.query.id as string;
  const user = await getAuth().getUser(userId);

  await deleteUser({
    userId,
    email: user.email || ``,
    displayName: user.displayName || ``,
    sendEmail: false,
  });

  return res.json({
    success: true,
  });
}
