import React from 'react';
import { Button, Empty } from 'antd';
import { ColumnConfig, Column } from '@ant-design/plots';
import { useNavigate } from 'react-router-dom';
import { BacklogHistory } from '../../api/types';
import useDailyCompletedPoints from './useDailyCompletedBacklog';

export default function DailyCompletedPointsBarGraph(props: {
  backlogHistory: BacklogHistory[];
  showButton?: boolean;
}) {
  const { backlogHistory, showButton } = props;
  const navigate = useNavigate();

  const data = useDailyCompletedPoints(backlogHistory);

  const config: ColumnConfig = {
    data,
    xField: 'date',
    yField: 'value',
    width: 400,
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
  return <Column {...config} />;
}
