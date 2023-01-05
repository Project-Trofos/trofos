import React from 'react';
import { Button, Collapse, message } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useParams } from 'react-router-dom';
import { Sprint, useUpdateSprintMutation } from '../../api/sprint';
import BacklogList from '../lists/BacklogList';
import SprintMenu from '../dropdowns/SprintMenu';
import './SprintListingCard.css';
import StrictModeDroppable from '../dnd/StrictModeDroppable';

function SprintListingCard(props: SprintListingCardProps): JSX.Element {
  const { sprint, setSprint, setIsModalVisible } = props;
  const { Panel } = Collapse;

  const params = useParams();
  const projectId = Number(params.projectId);

  const [updateSprint] = useUpdateSprintMutation();

  const handleSprintOnClick = (e: React.MouseEvent<HTMLDivElement>) => {
    setSprint(sprint);
    setIsModalVisible(true);
  };

  const handleSprintStatusUpdate = async (
    updatedStatus: 'upcoming' | 'current' | 'completed',
    e: React.MouseEvent<HTMLElement, MouseEvent>,
  ) => {
    e.stopPropagation();

    const payload = {
      status: updatedStatus,
      sprintId: sprint.id,
      ...(updatedStatus === 'current' ? { projectId } : {}),
    };

    try {
      await updateSprint(payload).unwrap();
      message.success('Sprint updated');
      console.log('Success');
    } catch (err: any) {
      message.error(err?.data?.error || 'Failed to update sprint');
      console.error(err);
    }
  };

  const renderSprintStatusButton = () => {
    switch (sprint.status) {
      case 'upcoming':
        return <Button onClick={(e) => handleSprintStatusUpdate('current', e)}>Start Sprint</Button>;
      case 'current':
        return <Button onClick={(e) => handleSprintStatusUpdate('completed', e)}>Complete Sprint</Button>;
      case 'completed':
        return <Button onClick={(e) => handleSprintStatusUpdate('current', e)}>Reopen Sprint</Button>;
      default:
        // eslint-disable-next-line react/jsx-no-useless-fragment
        return <></>;
    }
  };

  return (
    <StrictModeDroppable droppableId={sprint.id.toString()}>
      {(provided) => (
        <div ref={provided.innerRef} {...provided.droppableProps}>
          <Collapse>
            <Panel
              key={sprint.id}
              header={
                <div className="sprint-card-inner-container">
                  <div className="sprint-card-name">{sprint.name}</div>
                  <div className="sprint-status-button">{renderSprintStatusButton()}</div>
                  {sprint.start_date && sprint.end_date && (
                    <div>{`${dayjs(sprint.start_date).format('DD/MM/YYYY')} - ${dayjs(sprint.end_date).format(
                      'DD/MM/YYYY',
                    )}`}</div>
                  )}
                  <div className="sprint-card-setting-icon" onClick={(e) => e.stopPropagation()}>
                    <SprintMenu sprintId={sprint.id} handleSprintOnClick={handleSprintOnClick} />
                  </div>
                </div>
              }
            >
              <BacklogList backlogs={sprint.backlogs} />
              {provided.placeholder}
            </Panel>
          </Collapse>
        </div>
      )}
    </StrictModeDroppable>
  );
}

type SprintListingCardProps = {
  sprint: Sprint;
  setSprint(sprint: Sprint): void;
  setIsModalVisible(isVisible: boolean): void;
};

export default SprintListingCard;
