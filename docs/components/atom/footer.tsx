import React from 'react';
import { cn } from '@/utils/tailwind-support';
import { Logo } from '@/components/atom/logo';

export function Footer(): JSX.Element {
  return (
    <footer
      className={cn(
        'w-full flex flex-col items-center justify-start gap-y-6',
        // 'px-6 py-8 md:p-7',
        // 'border-t border-main-200/60 dark:border-main-800/80 bg-main-50/80 dark:bg-main-900/80',
      )}
    >
      <Logo height={70} pure={true} />
      <span className={'text-xs md:text-sm text-mauve-8'}>
        © {new Date().getFullYear()} - ECA GreenTech Open Source
      </span>
    </footer>
  );
}
