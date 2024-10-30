import * as runtime from 'react/jsx-runtime';
import { Jsx, runSync } from '@mdx-js/mdx';
import type { NestedMDXComponents } from 'mdx/types';
import MDXComponents from '~/components/blog/MDXComponents';

function MDXRenderer({ code }: { code: string }) {
  const MDXModule = runSync(code, {
    baseUrl: import.meta.url,
    Fragment: runtime.Fragment,
    jsxs: runtime.jsxs as Jsx,
    jsx: runtime.jsx as Jsx,
  });

  return (
    <MDXModule.default components={MDXComponents as NestedMDXComponents} />
  );
}

export default MDXRenderer;
