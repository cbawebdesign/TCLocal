import { createContext } from 'react';
import { LayoutStyle } from '~/core/layout-style';

export const LayoutStyleContext = createContext<{
  layoutStyle: LayoutStyle;
  setLayoutStyle: (style: LayoutStyle) => void;
}>({
  layoutStyle: LayoutStyle.TopHeader,
  setLayoutStyle: (_) => _,
});
