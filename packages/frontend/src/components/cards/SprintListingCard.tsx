import React from 'react';
import { Collapse } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Sprint } from '../../api/sprint';
import BacklogList from '../lists/BacklogList';
import SprintMenu from '../dropdowns/SprintMenu';
import './SprintListingCard.css';

function SprintListingCard(props: SprintListingCardProps): JSX.Element {
  const { sprint, setSprint, setIsModalVisible } = props;
  const { Panel } = Collapse;

  const handleSprintOnClick = (e: React.MouseEvent<HTMLDivElement>) => {
    setSprint(sprint);
    setIsModalVisible(true);
  };

  return (
    <Collapse>
      <Panel
        key={sprint.id}
        header={
          <div className="sprint-card-inner-container">
            <div className="sprint-card-name">{sprint.name}</div>
            {sprint.start_date && sprint.end_date && (
              <div>{`${dayjs(sprint.start_date).format('DD/MM/YYYY')} - ${dayjs(sprint.end_date).format(
                'DD/MM/YYYY',
              )}`}</div>
            )}
            {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
            <div className="sprint-card-setting-icon" onClick={(e) => e.stopPropagation()}>
              <SprintMenu sprintId={sprint.id} handleSprintOnClick={handleSprintOnClick} />
            </div>
          </div>
        }
      >
        <BacklogList backlogs={sprint.backlogs} />
      </Panel>
    </Collapse>
  );
}

type SprintListingCardProps = {
  sprint: Sprint;
  setSprint(sprint: Sprint): void;
  setIsModalVisible(isVisible: boolean): void;
};

export default SprintListingCard;
