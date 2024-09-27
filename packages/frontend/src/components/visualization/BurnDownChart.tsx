import React from 'react';
import { Line } from '@ant-design/plots';
import { BacklogHistory } from '../../api/types';
import { Sprint } from '../../api/sprint';
import { useBurndownChart } from './useBurndownChart';
import { Subheading } from '../typography';
import { useAppSelector } from '../../app/hooks';

type BurnDownChartProps = {
  backlogHistory: BacklogHistory[];
  sprint?: Sprint;
  includeTitle?: boolean;
};

export function BurnDownChart(props: BurnDownChartProps): JSX.Element {
  const { backlogHistory, sprint, includeTitle } = props;
  const { storyPointData } = useBurndownChart(backlogHistory, sprint?.id, sprint?.end_date);
  const isDarkTheme = useAppSelector((state) => state.themeSlice.isDarkTheme);
  
  const config: React.ComponentProps<typeof Line> = {
    data: storyPointData,
    theme: isDarkTheme ? 'dark' : 'default',
    xField: 'date',
    yField: 'point',
    stepType: 'hv',
    meta: {
      date: {
        type: 'time',
      },
    },
    yAxis: {
      title: {
        text: 'Story Points',
      }
    },
    annotations: sprint ? [
      {
        type: 'line',  // Vertical line for sprint start
        start: [sprint.start_date, 'min'],
        end: [sprint.start_date, 'max'],
        style: {
          stroke: '#ff4d4f', // Red color for the line
          lineDash: [4, 4],  // Dashed line style
          lineWidth: 2,
        },
        text: {
          content: 'Sprint Start',
          position: 'start',
          style: { fill: '#ff4d4f' }, // Red color for the text
        },
      },
      {
        type: 'line',  // Vertical line for sprint end
        start: [sprint.end_date, 'min'],
        end: [sprint.end_date, 'max'],
        style: {
          stroke: '#52c41a', // Green color for the line
          lineDash: [4, 4],  // Dashed line style
          lineWidth: 2,
        },
        text: {
          content: 'Sprint End',
          position: 'start',
          style: { fill: '#52c41a' }, // Green color for the text
        },
      },
    ] : undefined,
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

  if (storyPointData.length === 0) {
    return <div>No data to display.</div>;
  }

  // eslint-disable-next-line react/jsx-props-no-spreading
  return (
    <>
      {includeTitle && <Subheading>Burn Down Chart</Subheading>}
      <Line {...config} />
    </>
  );
}
