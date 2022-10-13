import React from 'react';
import './Container.css';

export default function Container(props: React.ComponentPropsWithoutRef<'section'>) {
  const { className, children } = props;

  return <section className={`main-content-container ${className ?? ''}`}>{children}</section>;
}
