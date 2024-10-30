import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

import { completeOnboarding } from '~/lib/server/onboarding/complete-onboarding';
import { withPipe } from '~/core/middleware/with-pipe';
import { withAuthedUser } from '~/core/middleware/with-authed-user';
import { withMethodsGuard } from '~/core/middleware/with-methods-guard';
import { withExceptionFilter } from '~/core/middleware/with-exception-filter';
import { MembershipRole } from '~/lib/organizations/types/membership-role';
import { inviteMembers } from '~/lib/server/organizations/invite-members';

import logger from '~/core/logger';
import withCsrf from '~/core/middleware/with-csrf';
import configuration from '~/configuration';

const Body = z.object({
  organization: z.string(),
  invites: z.array(
    z.object({
      email: z.string().email(),
      role: z.nativeEnum(MembershipRole),
    }),
  ),
});

const SUPPORTED_HTTP_METHODS: HttpMethod[] = ['POST'];

async function onboardingHandler(req: NextApiRequest, res: NextApiResponse) {
  const { organization, invites } = await Body.parseAsync(req.body);
  const userId = req.firebaseUser.uid;

  const data = {
    userId,
    organizationName: organization,
  };

  const organizationId = await completeOnboarding(data);

  logger.info(
    {
      invites: invites.length,
    },
    `Processing ${invites.length} members invites...`,
  );

  await inviteMembers({
    organizationId,
    invites,
    inviterId: userId,
  });

  logger.info(
    {
      userId,
      organizationId,
    },
    `Onboarding successfully completed for user`,
  );

  return res.send({
    success: true,
    returnUrl: configuration.paths.appHome,
  });
}

export default function completeOnboardingHandler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const handler = withPipe(
    withCsrf(),
    withMethodsGuard(SUPPORTED_HTTP_METHODS),
    withAuthedUser,
    onboardingHandler,
  );

  return withExceptionFilter(req, res)(handler);
}
