import clsx from 'clsx';
import React from 'react';
import './Container.css';

export default function Container(
  props: React.ComponentPropsWithoutRef<'section'> & { fullWidth?: boolean; noGap?: boolean },
) {
  const { className, children, style, fullWidth, noGap, ...rest } = props;

  return (
    <section
      className={clsx(
        'main-content-container',
        { 'main-content-container-gap': !noGap },
        { 'limited-width': !fullWidth },
        className,
      )}
      {...rest}
    >
      {children}
    </section>
  );
}
