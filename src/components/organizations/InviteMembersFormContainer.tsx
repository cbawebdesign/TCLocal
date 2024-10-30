import { Trans, useTranslation } from 'next-i18next';
import { useCallback } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/router';

import Button from '~/core/ui/Button';
import If from '~/core/ui/If';

import InviteMembersForm from './InviteMembersForm';
import { useUserSession } from '~/core/hooks/use-user-session';
import { useCurrentOrganization } from '~/lib/organizations/hooks/use-current-organization';
import { MembershipRole } from '~/lib/organizations/types/membership-role';
import { useInviteMembers } from '~/lib/organizations/hooks/use-invite-members';
import { useCurrentUserRole } from '~/lib/organizations/hooks/use-current-user-role';

const InviteMembersFormContainer = () => {
  const { t } = useTranslation('organization');
  const router = useRouter();

  const user = useUserSession();
  const organization = useCurrentOrganization();
  const currentUserRole = useCurrentUserRole();
  const organizationId = organization?.id ?? '';

  const { trigger, isMutating } = useInviteMembers(organizationId);

  const navigateToInvitesPage = useCallback(() => {
    void router.push(`/settings/organization/invites`);
  }, [router]);

  const onSubmit = useCallback(
    async (
      invites: Array<{
        email: string;
        role: MembershipRole;
      }>,
    ) => {
      const promise = trigger(invites).then(() => {
        navigateToInvitesPage();
      });

      toast.promise(promise, {
        success: t(`inviteMembersSuccess`),
        error: t(`inviteMembersError`),
        loading: t(`inviteMembersLoading`),
      });
    },
    [navigateToInvitesPage, trigger, t],
  );

  const SubmitButton = (
    <div className={'flex'}>
      <Button
        className={'w-full lg:w-auto'}
        data-cy={'send-invites-button'}
        type={'submit'}
        loading={isMutating}
      >
        <If condition={!isMutating}>
          <Trans i18nKey={'organization:inviteMembersSubmitLabel'} />
        </If>

        <If condition={isMutating}>
          <Trans i18nKey={'organization:inviteMembersLoading'} />
        </If>
      </Button>
    </div>
  );

  return (
    <InviteMembersForm
      currentUserRole={currentUserRole}
      onSubmit={onSubmit}
      currentUserEmail={user?.auth?.email ?? ''}
      SubmitButton={SubmitButton}
    />
  );
};

export default InviteMembersFormContainer;
