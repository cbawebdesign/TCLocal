import Link from 'next/link';
import { useCallback, useState } from 'react';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';

import { Tooltip, TooltipTrigger, TooltipContent } from '~/core/ui/Tooltip';
import IconButton from '~/core/ui/IconButton';

const LOCAL_STORAGE_KEY = 'makerkit-banner';

const Banner: React.FC = () => {
  const [visible, setVisible] = useState(getIsVisible());

  const onClose = useCallback(() => {
    setVisible(false);
    localStorage.setItem(LOCAL_STORAGE_KEY, 'false');
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <div
      className={
        'z-10 w-[300px] items-center bg-yellow-300 text-black-300' +
        ' fixed left-5 bottom-5 hidden rounded-full px-8 py-4 sm:flex'
      }
    >
      <p className={'text-sm font-semibold'}>
        This is a demo of{' '}
        <Link className={'underline'} href={`https://makerkit.dev`}>
          Makerkit
        </Link>
        , a SaaS Starter for Next.js and Firebase.
      </p>

      <div className={'right-5 top-0.5'}>
        <Tooltip>
          <TooltipTrigger asChild>
            <IconButton
              onClick={onClose}
              className={'hover:bg-yellow-400' + ' dark:hover:bg-yellow-400'}
            >
              <XMarkIcon className={'h-5'} />
            </IconButton>
          </TooltipTrigger>

          <TooltipContent>Hide</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};

function getIsVisible() {
  const item = localStorage.getItem(LOCAL_STORAGE_KEY);

  if (!item) {
    return true;
  }

  return item !== 'false';
}

export default Banner;
