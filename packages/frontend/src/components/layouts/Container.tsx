import React from 'react';
import './Container.css';

export default function Container(props: React.ComponentPropsWithoutRef<'section'>) {
  const { className, children, style } = props;

  return <section className={`main-content-container ${className ?? ''}`} style={style}>{children}</section>;
}
