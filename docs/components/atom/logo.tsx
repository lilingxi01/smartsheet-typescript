import React from 'react';
import LogoSvg from '@/assets/logo.svg';
import LogoPureSvg from '@/assets/logo-pure.svg';

type LogoProps = {
  height?: number;
  pure?: boolean;
};

export function Logo({ height = 50, pure }: LogoProps): React.ReactNode {
  const IntegratedLogoSvg = pure ? LogoPureSvg : LogoSvg;
  return (
    <IntegratedLogoSvg
      width={pure ? height * 3 : height * 5}
      height={height}
      viewBox={pure ? '0 0 900 300' : '0 0 1500 300'}
      className={'[&>g>*:nth-child(1)]:!fill-mauve-12 [&>g>*:nth-child(2)]:!fill-mauve-8 [&>g>*:nth-child(3)]:!fill-mauve-8'}
    />
  );
}
