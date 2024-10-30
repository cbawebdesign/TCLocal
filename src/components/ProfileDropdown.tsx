import { useMemo } from 'react';
import { Trans } from 'next-i18next';
import type { UserInfo } from 'firebase/auth';
import Link from 'next/link';
import classNames from 'clsx';

import {
  Cog8ToothIcon,
  ArrowLeftOnRectangleIcon,
  Squares2X2Icon,
  PaintBrushIcon,
  SunIcon,
  ComputerDesktopIcon,
  MoonIcon,
  CheckCircleIcon,
  EllipsisVerticalIcon,
} from '@heroicons/react/24/outline';

import If from '~/core/ui/If';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '~/core/ui/Dropdown';

import ProfileAvatar from './ProfileAvatar';
import configuration from '~/configuration';

import {
  setTheme,
  DARK_THEME_CLASSNAME,
  LIGHT_THEME_CLASSNAME,
  SYSTEM_THEME_CLASSNAME,
  getStoredTheme,
} from '~/core/theming';

const ProfileDropdown: React.FCC<{
  user: Maybe<UserInfo>;
  signOutRequested: () => void;
  className?: string;
  displayName?: boolean;
}> = ({ user, signOutRequested, className, displayName }) => {
  const signedInAsLabel = useMemo(() => {
    return (
      user?.email ||
      user?.phoneNumber || <Trans i18nKey={'common:anonymousUser'} />
    );
  }, [user]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        data-cy={'profile-dropdown-trigger'}
        className={classNames(
          'flex cursor-pointer focus:outline-none group items-center',
          className,
          {
            ['items-center space-x-2.5 rounded-lg border border-gray-100' +
            ' dark:border-dark-900 p-2 transition-colors' +
            ' hover:bg-gray-50 dark:hover:bg-dark-800/40']: displayName,
          },
        )}
      >
        <ProfileAvatar user={user} />

        <If condition={displayName}>
          <div className={'flex flex-col text-left w-full truncate'}>
            <span className={'text-sm truncate'}>{user?.displayName}</span>

            <span
              className={'text-xs text-gray-500 dark:text-gray-400 truncate'}
            >
              {signedInAsLabel}
            </span>
          </div>

          <EllipsisVerticalIcon
            className={'h-8 hidden text-gray-500 group-hover:flex'}
          />
        </If>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className={'!min-w-[15rem]'}
        collisionPadding={{ left: 25, right: 25 }}
        sideOffset={20}
      >
        <DropdownMenuItem className={'!h-10 rounded-none py-0'}>
          <div
            className={'flex flex-col justify-start truncate text-left text-xs'}
          >
            <div className={'text-gray-500 dark:text-gray-400'}>
              Signed in as
            </div>

            <div>
              <span className={'block truncate'}>{signedInAsLabel}</span>
            </div>
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem>
          <Link
            href={configuration.paths.appHome}
            className={'flex h-full w-full items-center space-x-2'}
          >
            <Squares2X2Icon className={'h-5'} />
            <span>
              <Trans i18nKey={'common:dashboardTabLabel'} />
            </span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem>
          <Link
            href={'/settings/profile'}
            className={'flex h-full w-full items-center space-x-2'}
          >
            <Cog8ToothIcon className={'h-5'} />
            <span>
              <Trans i18nKey={'common:settingsTabLabel'} />
            </span>
          </Link>
        </DropdownMenuItem>

        <If condition={configuration.features.enableThemeSwitcher}>
          <ThemeSelectorSubMenu />
        </If>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          role={'button'}
          onClick={signOutRequested}
          className={'flex !cursor-pointer items-center space-x-2'}
        >
          <ArrowLeftOnRectangleIcon className={'h-5'} />

          <span>
            <Trans i18nKey={'auth:signOut'} />
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

function ThemeSelectorSubMenu() {
  const currentTheme = useMemo(() => getStoredTheme(), []);

  const Wrapper: React.FCC = ({ children }) => (
    <span className={'flex items-center space-x-2.5'}>{children}</span>
  );

  return (
    <>
      <DropdownMenuSeparator className={'hidden lg:flex'} />

      <DropdownMenuSub>
        <DropdownMenuSubTrigger className={'hidden lg:flex'}>
          <Wrapper>
            <PaintBrushIcon className={'h-5'} />

            <span>
              <Trans i18nKey={'common:theme'} />
            </span>
          </Wrapper>
        </DropdownMenuSubTrigger>

        <DropdownMenuSubContent>
          <DropdownMenuItem
            className={'cursor-pointer flex justify-between items-center'}
            onClick={() => setTheme(LIGHT_THEME_CLASSNAME)}
          >
            <Wrapper>
              <SunIcon className={'h-4'} />

              <span>
                <Trans i18nKey={'common:lightTheme'} />
              </span>
            </Wrapper>

            <If condition={currentTheme === LIGHT_THEME_CLASSNAME}>
              <CheckCircleIcon className={'h-5'} />
            </If>
          </DropdownMenuItem>

          <DropdownMenuItem
            className={'cursor-pointer flex justify-between items-center'}
            onClick={() => setTheme(DARK_THEME_CLASSNAME)}
          >
            <Wrapper>
              <MoonIcon className={'h-4'} />

              <span>
                <Trans i18nKey={'common:darkTheme'} />
              </span>
            </Wrapper>

            <If condition={currentTheme === DARK_THEME_CLASSNAME}>
              <CheckCircleIcon className={'h-5'} />
            </If>
          </DropdownMenuItem>

          <DropdownMenuItem
            className={'cursor-pointer flex justify-between items-center'}
            onClick={() => setTheme(SYSTEM_THEME_CLASSNAME)}
          >
            <Wrapper>
              <ComputerDesktopIcon className={'h-4'} />

              <span>
                <Trans i18nKey={'common:systemTheme'} />
              </span>
            </Wrapper>

            <If condition={currentTheme === SYSTEM_THEME_CLASSNAME}>
              <CheckCircleIcon className={'h-5'} />
            </If>
          </DropdownMenuItem>
        </DropdownMenuSubContent>
      </DropdownMenuSub>
    </>
  );
}

export default ProfileDropdown;
