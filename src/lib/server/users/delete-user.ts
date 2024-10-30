import { getAuth } from 'firebase-admin/auth';

import { deleteOrganization } from '~/lib/server/organizations/delete-organization';
import logger from '~/core/logger';
import { getUserRefById } from '~/lib/server/queries';
import { getOrganizationsForUser } from '~/lib/admin/queries';
import { MembershipRole } from '~/lib/organizations/types/membership-role';
import renderAccountDeleteEmail from '~/lib/emails/account-delete';
import { sendEmail } from '~/core/email/send-email';

import configuration from '~/configuration';

/**
 * Deletes a user and all associated organizations.
 *
 **/
export async function deleteUser(params: {
  userId: string;
  email: string;
  displayName?: string;
  sendEmail?: boolean;
}) {
  const { userId, email, sendEmail, displayName } = params;
  const userOrganizations = await getUserOwnedOrganizations(userId);

  const requests = userOrganizations.map((organization) => {
    const organizationId = organization.id;

    return deleteOrganization({ organizationId });
  });

  const ids = userOrganizations.map(({ id }) => id);

  logger.info(
    {
      userId,
      organizations: ids,
    },
    `Deleting organizations user is Owner of...`,
  );

  await Promise.all(requests);

  logger.info(
    {
      userId,
      organizations: ids,
    },
    `Deleted organizations user is Owner of.`,
  );

  logger.info(
    {
      userId,
    },
    `Deleting user record and auth record...`,
  );

  const userRecord = await getUserRefById(userId);
  const authRecord = getAuth().deleteUser(userId);

  await Promise.all([userRecord.ref.delete(), authRecord]);

  logger.info(
    {
      userId,
    },
    `Successfully deleted user record and auth record.`,
  );

  const shouldSendEmail = sendEmail !== false;

  // if user has an email, send them an email confirming account deletion
  if (shouldSendEmail && email) {
    const userDisplayName = displayName || email;

    logger.info({ userId }, `Sending account deletion email...`);

    try {
      await sendAccountDeleteEmail({
        email,
        userDisplayName,
      });

      logger.info({ userId }, `Successfully sent account deletion email.`);
    } catch (error) {
      console.error(error);
      logger.error(
        {
          userId,
          error,
        },
        `Failed to send account deletion email.`,
      );
    }
  }
}

async function getUserOwnedOrganizations(userId: string) {
  return getOrganizationsForUser(userId).then((organizations) => {
    return organizations.filter(
      (organization) => organization.role === MembershipRole.Owner,
    );
  });
}

async function sendAccountDeleteEmail(params: {
  userDisplayName: string;
  email: string;
}) {
  const productName = configuration.site.siteName;

  const accountDeleteEmail = await renderAccountDeleteEmail({
    productName,
    userDisplayName: params.userDisplayName,
  });

  const subject = `Confirmation of Account Deletion on ${productName}`;
  const from = process.env.EMAIL_SENDER;

  if (!from) {
    throw new Error(`Missing EMAIL_SENDER env variable.`);
  }

  return sendEmail({
    to: params.email,
    subject,
    html: accountDeleteEmail,
    from,
  });
}
