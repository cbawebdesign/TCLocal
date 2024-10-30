import type { PropsWithChildren } from 'react';
import classNames from 'clsx';

import LogoImage from '~/core/ui/Logo/LogoImage';
import If from '~/core/ui/If';
import Spinner from '~/core/ui/Spinner';

export default function LoadingOverlay({
  children,
  className,
  fullPage = true,
  displayLogo = false,
  spinnerClassName,
}: PropsWithChildren<{
  className?: string;
  spinnerClassName?: string;
  fullPage?: boolean;
  displayLogo?: boolean;
}>) {
  return (
    <div
      className={classNames(
        'flex flex-col items-center justify-center space-y-4',
        className,
        {
          [`fixed !m-0 top-0 left-0 z-[100] h-screen w-screen bg-background overflow-hidden`]:
            fullPage,
        },
      )}
    >
      <If condition={displayLogo}>
        <LogoImage />
      </If>

      <Spinner
        className={classNames('h-12 w-12 text-primary', spinnerClassName)}
      />

      <div>{children}</div>
    </div>
  );
}
