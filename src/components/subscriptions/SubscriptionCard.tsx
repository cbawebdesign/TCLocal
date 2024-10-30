import { Trans, useTranslation } from 'next-i18next';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

import { OrganizationSubscription } from '~/lib/organizations/types/organization-subscription';

import Heading from '~/core/ui/Heading';
import PricingTable from '~/components/PricingTable';
import SubscriptionStatusBadge from '~/components/subscriptions/SubscriptionStatusBadge';
import SubscriptionStatusAlert from '~/components/subscriptions/SubscriptionStatusAlert';

import configuration from '~/configuration';
import If from '~/core/ui/If';

const SubscriptionCard: React.FC<{
  subscription: OrganizationSubscription;
}> = ({ subscription }) => {
  const details = useSubscriptionDetails(subscription.priceId);
  const cancelAtPeriodEnd = subscription.cancelAtPeriodEnd;
  const isActive = subscription.status === 'active';
  const { i18n } = useTranslation();
  const language = i18n.language;

  const dates = {
    endDate: getDateFromSeconds(subscription.periodEndsAt, language),
    trialEndDate: getDateFromSeconds(subscription.trialEndsAt, language),
  };

  if (!details) {
    return null;
  }

  return (
    <div
      className={'flex space-x-2'}
      data-cy={'subscription-card'}
      data-cy-status={subscription.status}
    >
      <div className={'flex flex-col space-y-4 w-9/12'}>
        <div className={'flex flex-col space-y-1'}>
          <div className={'flex items-center space-x-4'}>
            <Heading type={4}>
              <span data-cy={'subscription-name'}>{details.product.name}</span>
            </Heading>

            <div>
              <SubscriptionStatusBadge subscription={subscription} />
            </div>
          </div>

          <span className={'text-gray-500 dark:text-gray-400 text-sm'}>
            {details.product.description}
          </span>
        </div>

        <If condition={isActive}>
          <RenewStatusDescription
            dates={dates}
            cancelAtPeriodEnd={cancelAtPeriodEnd}
          />
        </If>

        <SubscriptionStatusAlert subscription={subscription} values={dates} />
      </div>

      <div className={'w-3/12'}>
        <span className={'flex items-center justify-end space-x-1'}>
          <PricingTable.Price>{details.plan.price}</PricingTable.Price>

          <span className={'lowercase text-gray-500 dark:text-gray-400'}>
            /{details.plan.name}
          </span>
        </span>
      </div>
    </div>
  );
};

function RenewStatusDescription(
  props: React.PropsWithChildren<{
    cancelAtPeriodEnd: boolean;
    dates: {
      endDate: string;
      trialEndDate: string | null;
    };
  }>,
) {
  return (
    <span className={'flex items-center space-x-1.5 text-sm'}>
      <If condition={props.cancelAtPeriodEnd}>
        <XCircleIcon className={'h-5 text-yellow-500'} />

        <span>
          <Trans
            i18nKey={'subscription:cancelAtPeriodEndDescription'}
            values={props.dates}
          />
        </span>
      </If>

      <If condition={!props.cancelAtPeriodEnd}>
        <CheckCircleIcon className={'h-5 text-green-700'} />

        <span>
          <Trans
            i18nKey={'subscription:renewAtPeriodEndDescription'}
            values={props.dates}
          />
        </span>
      </If>
    </span>
  );
}

function useSubscriptionDetails(priceId: string) {
  for (const product of configuration.stripe.products) {
    for (const plan of product.plans) {
      if (plan.stripePriceId === priceId) {
        return { plan, product };
      }
    }
  }
}

function getDateFromSeconds(seconds: Maybe<number> | null, language: string) {
  if (!seconds) {
    return '';
  }

  const endDateMs = seconds * 1000;

  return new Date(endDateMs).toLocaleDateString(language);
}

export default SubscriptionCard;
