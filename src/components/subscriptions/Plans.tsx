import React from 'react';
import { Trans } from 'next-i18next';

import { useCurrentOrganization } from '~/lib/organizations/hooks/use-current-organization';

import PlanSelectionForm from '~/components/subscriptions/PlanSelectionForm';
import BillingPortalRedirectButton from '~/components/subscriptions/BillingRedirectButton';

import If from '~/core/ui/If';
import SubscriptionCard from './SubscriptionCard';

import { canChangeBilling } from '~/lib/organizations/permissions';
import { IfHasPermissions } from '~/components/IfHasPermissions';

const Plans: React.FC = () => {
  const organization = useCurrentOrganization();

  if (!organization) {
    return null;
  }

  const customerId = organization.customerId;
  const subscription = organization.subscription;

  if (!subscription) {
    return <PlanSelectionForm organization={organization} />;
  }

  return (
    <div className={'flex flex-col space-y-4'}>
      <div>
        <div
          className={'border w-full lg:w-9/12 xl:w-6/12 rounded-xl divide-y'}
        >
          <div className={'p-6'}>
            <SubscriptionCard subscription={subscription} />
          </div>

          <IfHasPermissions condition={canChangeBilling}>
            <If condition={customerId}>
              <div className={'flex justify-end p-6'}>
                <div className={'flex flex-col space-y-2 items-end'}>
                  <BillingPortalRedirectButton
                    customerId={customerId as string}
                  >
                    <Trans i18nKey={'subscription:manageBilling'} />
                  </BillingPortalRedirectButton>

                  <span className={'text-xs text-gray-500 dark:text-gray-400'}>
                    <Trans i18nKey={'subscription:manageBillingDescription'} />
                  </span>
                </div>
              </div>
            </If>
          </IfHasPermissions>
        </div>
      </div>
    </div>
  );
};

export default Plans;
