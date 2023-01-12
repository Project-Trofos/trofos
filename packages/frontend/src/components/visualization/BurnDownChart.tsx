import React from 'react';
import { Line } from '@ant-design/plots';
import { BacklogHistory } from '../../api/backlog';
import { Sprint } from '../../api/sprint';
import { useBurndownChart } from './useBurndownChart';

type BurnDownChartProps = {
  backlogHistory: BacklogHistory[];
  sprint: Sprint | undefined;
};

export function BurnDownChart(props: BurnDownChartProps): JSX.Element {
  const { backlogHistory, sprint } = props;
  const { storyPointData } = useBurndownChart(backlogHistory, sprint?.id);

  const config: React.ComponentProps<typeof Line> = {
    data: storyPointData,
    xField: 'date',
    yField: 'point',
    stepType: 'hv',
    meta: {
      date: {
        type: 'time',
      },
    },
    tooltip: {
      // eslint-disable-next-line react/no-unstable-nested-components
      customContent: (title, items) => {
        return (
          <>
            <h4 style={{ marginTop: '12px' }}>{title}</h4>
            <ul style={{ paddingLeft: 0 }}>
              {items.length > 0 && (
                <li className="g2-tooltip-list-item" style={{ display: 'flex', alignItems: 'center' }}>
                  <span className="g2-tooltip-marker" style={{ backgroundColor: items[0].color }} />
                  <span style={{ display: 'inline-flex', flex: 1, justifyContent: 'space-between' }}>
                    <span style={{ marginRight: 16 }}>{items[0].name}:</span>
                    <span className="g2-tooltip-list-item-value">{items[0].value}</span>
                  </span>
                </li>
              )}
            </ul>

            {items.length > 0 && (
              <div style={{ marginBottom: '20px', maxWidth: '130px' }} key={items[0].data.backlog_id}>
                {items[0].data.message}
              </div>
            )}
          </>
        );
      },
    },
  };

  if (!sprint) {
    return <div>Please select a sprint to display.</div>;
  }

  // eslint-disable-next-line react/jsx-props-no-spreading
  return <Line {...config} />;
}
