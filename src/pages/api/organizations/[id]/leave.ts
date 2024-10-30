import { NextApiRequest, NextApiResponse } from 'next';
import { FieldValue } from 'firebase-admin/firestore';

import { withPipe } from '~/core/middleware/with-pipe';
import withCsrf from '~/core/middleware/with-csrf';
import { withMethodsGuard } from '~/core/middleware/with-methods-guard';
import { withAuthedUser } from '~/core/middleware/with-authed-user';
import getRestFirestore from '~/core/firebase/admin/get-rest-firestore';
import { ORGANIZATIONS_COLLECTION } from '~/lib/firestore-collections';
import { getUserRoleByOrganization } from '~/lib/server/organizations/memberships';
import { MembershipRole } from '~/lib/organizations/types/membership-role';

import {
  throwForbiddenException,
  throwNotFoundException,
} from '~/core/http-exceptions';

/**
 * Removes a user from an organization.
 */
async function leaveOrganizationHandler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const organizationId = req.query.id as string;
  const userId = req.firebaseUser.uid;

  const firestore = getRestFirestore();

  const role = await getUserRoleByOrganization({
    userId,
    organizationId,
  });

  // check if user is in organization
  if (role === undefined) {
    return throwNotFoundException(`User ${userId} not found in organization`);
  }

  // check if user is owner
  if (role === MembershipRole.Owner) {
    return throwForbiddenException(`Owner can't leave organization`);
  }

  const organizationRef = firestore
    .collection(ORGANIZATIONS_COLLECTION)
    .doc(organizationId);

  const memberPath = `members.${userId}`;

  await organizationRef.update({
    [memberPath]: FieldValue.delete(),
  });

  return res.status(200).json({
    success: true,
  });
}

export default withPipe(
  withCsrf(),
  withMethodsGuard(['POST']),
  withAuthedUser,
  leaveOrganizationHandler,
);
