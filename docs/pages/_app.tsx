import type { ReactElement } from 'react';
import type { AppProps } from 'next/app';

import '../style.scss';

export default function Nextra({
  Component,
  pageProps,
}: AppProps): ReactElement {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return <Component {...pageProps} />;
}
