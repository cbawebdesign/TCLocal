import { NextApiRequest, NextApiResponse } from 'next';

import { withPipe } from '~/core/middleware/with-pipe';
import { withMethodsGuard } from '~/core/middleware/with-methods-guard';
import withCsrf from '~/core/middleware/with-csrf';
import { withExceptionFilter } from '~/core/middleware/with-exception-filter';
import { withAuthedUser } from '~/core/middleware/with-authed-user';
import { deleteUser } from '~/lib/server/users/delete-user';

import logger from '~/core/logger';

export default function deleteAccountHandler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const handler = withPipe(
    withMethodsGuard(['DELETE']),
    withCsrf(),
    withAuthedUser,
    userHandler,
  );

  return withExceptionFilter(req, res)(handler);
}

async function userHandler(req: NextApiRequest, res: NextApiResponse) {
  const user = req.firebaseUser;
  const userId = user.uid;

  logger.info(
    {
      userId,
    },
    `User requested to delete their account. Proceeding...`,
  );

  // execute the delete user function with the user id
  // this will delete the user from firebase auth and firestore
  await deleteUser({
    userId,
    email: user.email || '',
    displayName: user.displayName,
    sendEmail: true,
  });

  res.status(200).json({});
}
