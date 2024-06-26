import { Typography } from 'antd';
import React from 'react';
import styles from './PageHeader.module.css';

const { Title } = Typography;

export type PageHeaderProps = {
  title?: string;
  subTitle?: JSX.Element;
  extra?: JSX.Element[];
  breadcrumb?: JSX.Element;
  footer?: JSX.Element;
};

export default function PageHeader(props: React.ComponentPropsWithoutRef<'div'> & PageHeaderProps): JSX.Element {
  // TODO: Make breadcrumb a useContext
  const { style, title, subTitle, extra, breadcrumb, footer, children } = props;
  return (
    <div className={styles.container} style={style}>
      <div className={styles['title-row']}>
        <>{breadcrumb}</>
        {!title && <div>{extra}</div>}
      </div>
      {title && (
        <div className={styles['title-row']}>
          <div>
            <Title level={4}>{title}</Title>
            {subTitle}
          </div>
          <div>{extra}</div>
        </div>
      )}
      {children}
      {footer}
    </div>
  );
}
