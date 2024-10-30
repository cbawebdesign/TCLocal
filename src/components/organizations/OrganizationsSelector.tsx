import Image from 'next/image';
import { useRouter } from 'next/router';
import classNames from 'clsx';

import { Trans } from 'next-i18next';
import {
  EllipsisVerticalIcon,
  PlusCircleIcon,
} from '@heroicons/react/24/outline';

import { Organization } from '~/lib/organizations/types/organization';
import { useFetchUserOrganizations } from '~/lib/organizations/hooks/use-fetch-user-organizations';
import { useCurrentOrganization } from '~/lib/organizations/hooks/use-current-organization';

import If from '~/core/ui/If';
import CreateOrganizationModal from './CreateOrganizationModal';

import {
  Select,
  SelectItem,
  SelectContent,
  SelectSeparator,
  SelectGroup,
  SelectAction,
  SelectLabel,
  SelectValue,
  SelectTrigger,
} from '~/core/ui/Select';

import ClientOnly from '~/core/ui/ClientOnly';
import { Avatar, AvatarFallback } from '~/core/ui/Avatar';

import { useUserId } from '~/core/hooks/use-user-id';
import configuration from '~/configuration';

const OrganizationsSelector = ({ displayName }: { displayName: boolean }) => {
  const router = useRouter();
  const organization = useCurrentOrganization();
  const value = getDeepLinkPath(organization?.id as string);
  const userId = useUserId();

  return (
    <>
      <Select
        value={value}
        onValueChange={(path) => {
          return router.replace(path);
        }}
      >
        <SelectTrigger asChild>
          <div
            role={'button'}
            className={classNames(
              `text-sm flex lg:text-base w-full group hover:bg-gray-50 cursor-pointer border-transparent dark:hover:bg-dark-900/50 dark:hover:text-white`,
              {
                ['justify-between max-h-12']: displayName,
                ['rounded-full border-none !p-0.5 mx-auto']: !displayName,
              },
            )}
            data-cy={'organization-selector'}
          >
            <OrganizationItem
              organization={organization}
              displayName={displayName}
            />

            <If condition={displayName}>
              <EllipsisVerticalIcon
                className={'h-5 hidden group-hover:block text-gray-500'}
              />
            </If>

            <span hidden>
              <SelectValue />
            </span>
          </div>
        </SelectTrigger>

        <SelectContent position={'popper'}>
          <SelectGroup>
            <SelectLabel>
              <Trans i18nKey={'common:yourOrganizations'} />
            </SelectLabel>

            <SelectSeparator />

            <ClientOnly>
              {userId && (
                <OrganizationsOptions
                  organization={organization}
                  userId={userId}
                />
              )}
            </ClientOnly>
          </SelectGroup>

          <SelectSeparator />

          <SelectGroup>
            <CreateOrganizationModal
              onCreate={(organizationId) => {
                return router.replace(getDeepLinkPath(organizationId));
              }}
            >
              <SelectAction>
                <span
                  data-cy={'create-organization-button'}
                  className={'flex flex-row items-center space-x-2 truncate'}
                >
                  <PlusCircleIcon className={'h-5'} />

                  <span>
                    <Trans
                      i18nKey={'organization:createOrganizationDropdownLabel'}
                    />
                  </span>
                </span>
              </SelectAction>
            </CreateOrganizationModal>
          </SelectGroup>
        </SelectContent>
      </Select>
    </>
  );
};

function OrganizationsOptions({
  userId,
  organization,
}: React.PropsWithChildren<{
  userId: string;
  organization: Maybe<WithId<Organization>>;
}>) {
  const { data, status } = useFetchUserOrganizations(userId);
  const isLoading = status === 'loading';

  if (isLoading && organization) {
    const href = getDeepLinkPath(organization?.id as string);

    return (
      <SelectItem value={href} key={organization.id}>
        <OrganizationItem organization={organization} />
      </SelectItem>
    );
  }

  const organizations = data ?? [];

  return (
    <>
      {organizations.map((item) => {
        const href = getDeepLinkPath(item.id);

        return (
          <SelectItem value={href} key={item.id}>
            <OrganizationItem organization={item} />
          </SelectItem>
        );
      })}
    </>
  );
}

function OrganizationItem({
  organization,
  displayName = true,
}: {
  organization: Maybe<Organization>;
  displayName?: boolean;
}) {
  const imageSize = 20;

  if (!organization) {
    return null;
  }

  const { logoURL, name } = organization;

  return (
    <div
      data-cy={'organization-selector-item'}
      className={classNames(`flex max-w-[12rem] items-center space-x-2.5`, {
        'w-full': !displayName,
      })}
    >
      <If
        condition={logoURL}
        fallback={
          <FallbackOrganizationLogo
            className={displayName ? '' : 'mx-auto'}
            name={organization.name}
          />
        }
      >
        <Image
          width={imageSize}
          height={imageSize}
          alt={`${name} Logo`}
          className={'object-contain w-6 h-6 mx-auto'}
          src={logoURL as string}
        />
      </If>

      <If condition={displayName}>
        <span className={'w-auto truncate text-sm'}>{name}</span>
      </If>
    </div>
  );
}

function getDeepLinkPath(organizationId: string) {
  return ['', organizationId, configuration.paths.appHome].join('/');
}

export default OrganizationsSelector;

function FallbackOrganizationLogo(
  props: React.PropsWithChildren<{
    name: string;
    className?: string;
  }>,
) {
  const initials = (props.name ?? '')
    .split(' ')
    .reduce((acc, word) => {
      return acc + word[0];
    }, '')
    .slice(0, 1);

  return (
    <Avatar className={classNames('!w-6 !h-6', props.className)}>
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  );
}
