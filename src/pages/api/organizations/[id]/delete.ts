import { NextApiRequest, NextApiResponse } from 'next';
import { destroyCookie } from 'nookies';

import { withPipe } from '~/core/middleware/with-pipe';
import withCsrf from '~/core/middleware/with-csrf';
import { withMethodsGuard } from '~/core/middleware/with-methods-guard';
import { withAuthedUser } from '~/core/middleware/with-authed-user';
import { deleteOrganization } from '~/lib/server/organizations/delete-organization';
import logger from '~/core/logger';
import { getUserRoleByOrganization } from '~/lib/server/organizations/memberships';

import {
  throwForbiddenException,
  throwNotFoundException,
} from '~/core/http-exceptions';

import { MembershipRole } from '~/lib/organizations/types/membership-role';

async function deleteOrganizationHandler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const organizationId = req.query.id as string;
  const userId = req.firebaseUser.uid;

  logger.info(
    {
      organizationId,
      userId,
    },
    `User requested to delete organization. Deleting...`,
  );

  await assertUserIsOwner({
    userId,
    organizationId,
  });

  await deleteOrganization({
    organizationId,
  });

  destroyCookie({ res }, 'organizationId');
  destroyCookie({ res }, 'sessionId');

  return res.status(200).json({
    success: true,
  });
}

export default withPipe(
  withCsrf(),
  withMethodsGuard(['POST']),
  withAuthedUser,
  deleteOrganizationHandler,
);

async function assertUserIsOwner(params: {
  userId: string;
  organizationId: string;
}) {
  const role = await getUserRoleByOrganization(params);

  logger.info(
    params,
    'Verifying user has permissions to delete organization...',
  );

  // check if user is in organization
  if (!role) {
    return throwNotFoundException(
      `User ${params.userId} not found in organization`,
    );
  }

  // check if user is owner
  if (role !== MembershipRole.Owner) {
    return throwForbiddenException(`Only owner can delete organization`);
  }
}
