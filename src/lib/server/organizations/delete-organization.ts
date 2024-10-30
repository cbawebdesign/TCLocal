import getRestFirestore from '~/core/firebase/admin/get-rest-firestore';
import logger from '~/core/logger';

import { throwNotFoundException } from '~/core/http-exceptions';

import {
  INVITES_COLLECTION,
  ORGANIZATIONS_COLLECTION,
} from '~/lib/firestore-collections';

import { Organization } from '~/lib/organizations/types/organization';
import { getStripeInstance } from '~/core/stripe/get-stripe';

/**
 * Deletes an organization from the database. It also cancels the subscription if the organization has one.
 *
 * @param {Object} params - The parameters for deleting an organization.
 * @param {string} params.organizationId - The ID of the organization to delete.
 **/
export async function deleteOrganization(params: { organizationId: string }) {
  const { organizationId } = params;
  const firestore = getRestFirestore();

  const organizationRef = firestore
    .collection(ORGANIZATIONS_COLLECTION)
    .doc(organizationId);

  const data = await organizationRef
    .get()
    .then((doc) => doc.data() as Organization);

  // we need to check if organization exists
  if (!data) {
    return throwNotFoundException(`Organization ${organizationId} not found`);
  }

  // if organization has a subscription, cancel it
  if (data.subscription) {
    logger.info(
      {
        organizationId,
        subscriptionId: data.subscription.id,
      },
      'Canceling stripe subscription...',
    );

    await cancelStripeSubscription(data.subscription.id);

    logger.info(
      {
        organizationId,
        subscriptionId: data.subscription.id,
      },
      'Successfully canceled stripe subscription.',
    );
  }

  logger.info(
    {
      organizationId,
    },
    'Deleting organization and invites...',
  );

  // delete organization and invites from database
  const deletePromises = await getDeletePendingInvitesPromises(organizationRef);
  await Promise.all([organizationRef.delete(), ...deletePromises]);

  logger.info(
    {
      organizationId,
    },
    'Successfully deleted organization and invites.',
  );
}

/**
 * Deletes all pending invites for an organization.
 */
async function getDeletePendingInvitesPromises(
  organizationRef: FirebaseFirestore.DocumentReference,
) {
  const invites = organizationRef.collection(INVITES_COLLECTION);

  return invites.get().then((snapshot) => {
    return snapshot.docs.map((doc) => doc.ref.delete());
  });
}

/**
 * Cancels a Stripe subscription when an organization is deleted.
 *
 * @param {string} subscriptionId - The ID of the subscription to be cancelled.
 */
async function cancelStripeSubscription(subscriptionId: string): Promise<void> {
  const stripe = await getStripeInstance();

  try {
    await stripe.subscriptions.cancel(subscriptionId, {
      invoice_now: true,
    });
  } catch (e) {
    logger.error(
      {
        e,
      },
      'Failed to cancel stripe subscription',
    );

    throw e;
  }
}
