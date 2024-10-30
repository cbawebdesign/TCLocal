import { NextApiRequest, NextApiResponse } from 'next';
import { withAdmin as withFirebaseAdmin } from '~/core/middleware/with-admin';
import { isSuperAdmin } from '~/lib/admin/utils/is-super-admin';
import { throwUnauthorizedException } from '~/core/http-exceptions';
import withCsrf from '~/core/middleware/with-csrf';

import { deleteOrganization } from '~/lib/server/organizations/delete-organization';

export default async function deleteOrganizationHandler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await withFirebaseAdmin();
  await withCsrf()(req);

  const isAdmin = await isSuperAdmin({ req, res });

  if (!isAdmin) {
    return throwUnauthorizedException();
  }

  const organizationId = req.query.id as string;

  await deleteOrganization({
    organizationId,
  });

  return res.json({
    success: true,
  });
}
