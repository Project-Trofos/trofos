import React from 'react';
import { Button, Empty } from 'antd';
import { ColumnConfig, Column } from '@ant-design/plots';
import { useNavigate } from 'react-router-dom';
import { BacklogHistory } from '../../api/types';
import useDailyCompletedPoints from './useDailyCompletedBacklog';
import { Subheading } from '../typography';
import { useAppSelector } from '../../app/hooks';

// TODO: Split by user
export default function DailyCompletedPointsBarGraph(props: {
  backlogHistory: BacklogHistory[];
  showButton?: boolean;
}) {
  const { backlogHistory, showButton } = props;
  const navigate = useNavigate();

  const data = useDailyCompletedPoints(backlogHistory);
  const isDarkTheme = useAppSelector((state) => state.localSettingsSlice.isDarkTheme);
  const config: ColumnConfig = {
    data,
    theme: isDarkTheme ? 'dark' : 'default',
    xField: 'date',
    yField: 'value',
    height: 300,
    meta: {
      values: {
        alias: 'story points completed',
      },
    },
  };

  if (data.length === 0) {
    return (
      <Empty description="There are no completed issues in this sprint yet...">
        {showButton && (
          <Button type="primary" onClick={() => navigate('../board')}>
            View Board
          </Button>
        )}
      </Empty>
    );
  }

  // eslint-disable-next-line react/jsx-props-no-spreading
  return (
    <>
      <Subheading style={{ textAlign: 'center' }}>Daily Completed Story Points</Subheading>
      <Column {...config} />
    </>
  );
}
