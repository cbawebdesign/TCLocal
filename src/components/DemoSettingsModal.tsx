import { useContext } from 'react';
import classNames from 'clsx';

import Modal from '~/core/ui/Modal';
import Label from '~/core/ui/Label';
import { LayoutStyle } from '~/core/layout-style';
import { LayoutStyleContext } from '~/lib/contexts/layout';
import Button from '~/core/ui/Button';

const layoutStyleOptions = [
  {
    value: LayoutStyle.TopHeader,
    label: `Top Header Layout`,
  },
  { value: LayoutStyle.Sidebar, label: `Sidebar Layout` },
];

const DemoSettingsModal: React.FC<{
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}> = ({ isOpen, setIsOpen }) => {
  const { layoutStyle, setLayoutStyle } = useContext(LayoutStyleContext);

  return (
    <Modal heading={`Demo Settings`} isOpen={isOpen} setIsOpen={setIsOpen}>
      <div className={'mb-8 flex flex-col space-y-8'}>
        <div className={'flex flex-col space-y-2'}>
          <Label>Layout</Label>

          <div className={'flex'}>
            <Button
              type={'button'}
              className={classNames(
                'rounded-r-none border-r border-r-primary-800',
                {
                  '!bg-primary-900 text-white':
                    layoutStyle === layoutStyleOptions[0].value,
                },
              )}
              onClick={() => setLayoutStyle(layoutStyleOptions[0].value)}
            >
              {layoutStyleOptions[0].label}
            </Button>

            <Button
              type={'button'}
              className={classNames('rounded-l-none', {
                '!bg-primary-900 text-white':
                  layoutStyle === layoutStyleOptions[1].value,
              })}
              onClick={() => setLayoutStyle(layoutStyleOptions[1].value)}
            >
              {layoutStyleOptions[1].label}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default DemoSettingsModal;
