import React from 'react';
import Balancer from 'react-wrap-balancer';
import { IconTerminal } from '@tabler/icons-react';

export function LandingHeroSection() {
  return (
    <section className={'w-full min-h-[calc(100vh-var(--nextra-navbar-height))] flex flex-col items-center justify-center relative'}>
      <div className={'w-full flex flex-col items-center pb-6 gap-y-4 md:gap-y-6'}>
        <h1 className={'w-full text-center text-3xl lg:text-6xl font-semibold text-mauve-12'}>
          <Balancer>
            Refine Production Safety for Smartsheet Integrations
          </Balancer>
        </h1>
        <p className={'text-base md:text-lg text-mauve-9 text-center text-main-400 dark:text-main-600'}>
          <Balancer>
            Production accidents are costly and usually caused by human error instead of lack of proper knowledge.
            Even with the best training, it is difficult to remember all the details of a complex process.
            The Smartsheet SDK for TypeScript reduces the risk of human error by providing a simple, intuitive,
            and end-to-end type-safe interface for interacting with Smartsheet API.
          </Balancer>
        </p>
        <div className={'w-full flex flex-col items-center justify-center gap-y-2 mt-1'}>
          <div
            className={'flex flex-row items-center justify-center gap-x-2.5 px-4 py-2.5 rounded-full bg-mauve-a3 group'}>
            <IconTerminal size={18} stroke={2} className={'text-mauve-8 -mx-0.5'}/>
            <span className={'font-mono text-sm font-semibold text-mauve-9 group-hover:text-mauve-12 ux-cubic'}>
              npm install smartsheet-typescript
            </span>
          </div>
          <p className={'text-sm font-normal text-mauve-8'}>
            Or any other package manager you prefer (e.g. yarn, pnpm, and bun)
          </p>
        </div>
      </div>
    </section>
  );
}

type LandingFeatureItemProps = {
  title: string;
  children: string;
};

function LandingTermItem({ title, children }: LandingFeatureItemProps): JSX.Element {
  return (
    <div className={'w-full flex flex-col md:flex-row items-start justify-start gap-x-6 gap-y-2'}>
      <h2 className={'w-full md:w-[36%] shrink-0 text-2xl font-semibold text-mauve-12'}>
        {title}
      </h2>
      <p className={'min-w-0 grow text-mauve-9 text-base md:text-lg'}>
        {children}
      </p>
    </div>
  );
}

export function LandingTermsSection() {
  return (
    <section className={'w-full flex flex-col items-center justify-center gap-y-12 relative'}>
      <LandingTermItem
        title={'What does end-to-end type-safe mean?'}
      >
        The Smartsheet SDK for TypeScript not only utilizes TypeScript to provide type-safe interfaces for interacting with Smartsheet API,
        but also checks the validity of the data you are sending to or receiving from Smartsheet API.
        This means that you will never have to worry about sending invalid data to or receiving invalid data from Smartsheet API.
        Normal TypeScript typing system does not check the validity of the data at runtime, but the Smartsheet SDK for TypeScript does.
      </LandingTermItem>
      <LandingTermItem
        title={'How does the type-safe interface work?'}
      >
        Instead of just reinforcing the type safety at API parameters and responses, we allow you to define your data model.
        That means, you can explicitly declare the column structures of your sheet and we will provide type hints for all the SDK functions.
        This is extra convenient and secure when working with Smartsheet API or handling data model transformation while working as a team.
      </LandingTermItem>
      <LandingTermItem
        title={'How do I know if my data is secure with Smartsheet SDK for TypeScript?'}
      >
        As a package, we port the official Smartsheet REST API onto a convenient and type-safe interface.
        All data will only be sent to Smartsheet API and will not be stored anywhere else.
        Our package is fully open-sourced and reviewed carefully by professional software engineers at ECA Solar LLC.
        If you are still concerned about the security of your data, you can always check the source code of the package.
        You can also fork the package and make your own changes to this SDK, so that it is only yours.
      </LandingTermItem>
    </section>
  );
}
