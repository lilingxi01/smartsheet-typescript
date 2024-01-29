import React from 'react';
import { Logo } from '@/components/atom/logo';
import { Footer } from '@/components/atom/footer';

export default {
  logo: (
    <Logo />
  ),
  footer: {
    text: (
      <Footer />
    ),
  },
  sidebar: {
    titleComponent: ({ title, type }) => {
      if (type === 'separator') {
        return <span style={{ cursor: 'default', userSelect: 'none' }}>{title}</span>;
      }
      return <>{title}</>;
    },
    defaultMenuCollapseLevel: 1,
  },
  docsRepositoryBase: 'https://github.com/ECA-Greentech/smartsheet-typescript/tree/main/docs',
  project: {
    link: 'https://github.com/ECA-Greentech/smartsheet-typescript',
  },
  useNextSeoProps() {
    return {
      titleTemplate: '%s – Smartsheet SDK for TypeScript',
    };
  },
};
