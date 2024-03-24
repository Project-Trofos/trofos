import React from 'react';
import { Area } from '@ant-design/plots';
import { useCummulativeFlowConfig, useCummulativeFlowData } from './useCumulativeFlow';
import { DatePicker } from 'antd';
import { BacklogHistory } from '../../../api/types';

const { RangePicker } = DatePicker;

// TODO: move rangePicker up to page level
export function CumulativeFlowDiagram(props: { backlogHistory: BacklogHistory[] }): JSX.Element {
  const { backlogHistory } = props;
  const data = useCummulativeFlowData(backlogHistory);

  if (!data || data.length === 0) {
    return <div>No data to display.</div>;
  }

  const { config, setDateRange } = useCummulativeFlowConfig(data);

  // eslint-disable-next-line react/jsx-props-no-spreading
  return (
    <div>
      <RangePicker onCalendarChange={setDateRange} />
      <Area {...config} />
    </div>
  );
}
