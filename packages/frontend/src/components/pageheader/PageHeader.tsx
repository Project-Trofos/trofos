import { Space, Typography } from 'antd';
import React from 'react';
import styles from './PageHeader.module.css';

const { Title } = Typography;

export type PageHeaderProps = {
  title: string;
  subTitle?: JSX.Element;
  extra?: JSX.Element[];
  breadcrumb?: JSX.Element;
  footer?: JSX.Element;
};

export default function PageHeader(props: React.ComponentPropsWithoutRef<'div'> & PageHeaderProps): JSX.Element {
  const { style, title, subTitle, extra, breadcrumb, footer, children } = props;
  return (
    <div className={styles.container} style={style}>
      {breadcrumb}
      <div className={styles.titleRow}>
        <div className={styles.titleGroup}>
          <Title level={4}>{title}</Title>
          {subTitle}
        </div>
        <div>{extra}</div>
      </div>
      {children}
      {footer}
    </div>
  );
}
