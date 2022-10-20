import React from 'react';
import { Button, Collapse, message } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { Sprint, useUpdateSprintMutation } from '../../api/sprint';
import BacklogList from '../lists/BacklogList';
import SprintMenu from '../dropdowns/SprintMenu';
import './SprintListingCard.css';

function SprintListingCard(props: SprintListingCardProps): JSX.Element {
  const { sprint, setSprint, setIsModalVisible } = props;
  const { Panel } = Collapse;

  const [updateSprint] = useUpdateSprintMutation();

  const handleSprintOnClick = (e: React.MouseEvent<HTMLDivElement>) => {
    setSprint(sprint);
    setIsModalVisible(true);
  };

  const handleSprintStatusUpdate = async (updatedStatus: 'upcoming' | 'current' | 'completed') => {
    const payload = {
      status: updatedStatus,
      sprintId: sprint.id,
    };

    try {
      await updateSprint(payload).unwrap();
      message.success('Sprint updated');
      console.log('Success');
    } catch (e) {
      console.error(e);
    }
  }

  const renderSprintStatusButton = () => {
    switch (sprint.status) {
      case 'upcoming':
        return <Button onClick={() => handleSprintStatusUpdate('current')}>Start Sprint</Button>;
      case 'current':
        return <Button onClick={() => handleSprintStatusUpdate('completed')}>Complete Sprint</Button>;
      case 'completed':
        return <Button onClick={() => handleSprintStatusUpdate('upcoming')}>Reopen Sprint</Button>;
      default:
        return <div>{sprint.status}</div>;
    }
  };

  return (
    <Collapse>
      <Panel
        key={sprint.id}
        header={
          <div className="sprint-card-inner-container">
            <div className="sprint-card-name">{sprint.name}</div>
            <div className="sprint-status-button">
              {renderSprintStatusButton()}
            </div>
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
