import React, { useState } from 'react';
import { Button, Collapse, message } from 'antd';
import { BookOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useNavigate, useParams } from 'react-router-dom';
import { useUpdateSprintMutation } from '../../api/socket/sprintHooks';
import { Sprint } from '../../api/sprint';
import BacklogList from '../lists/BacklogList';
import SprintMenu from '../dropdowns/SprintMenu';
import StrictModeDroppable from '../dnd/StrictModeDroppable';
import SprintNotesModal from '../modals/SprintNotesModal';
import './SprintListingCard.css';

function SprintListingCard(props: SprintListingCardProps): JSX.Element {
  const { sprint, setSprint, setIsModalVisible } = props;
  const { Panel } = Collapse;
  const navigate = useNavigate();

  const [isNotesOpen, setIsNotesOpen] = useState(false);

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
      projectId,
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

  const navigateToRetrospective = (sprintId: number) => {
    navigate(`./${sprintId}/retrospective`);
  };

  const openSprintNotesModal = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    e.stopPropagation();
    setIsNotesOpen(true);
  };

  return (
    <>
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
                    {(sprint.status === 'completed' || sprint.status === 'closed') && (
                      <div className="sprint-retro-button">
                        <Button onClick={() => navigateToRetrospective(sprint.id)}>Retrospective</Button>
                      </div>
                    )}
                    {sprint.start_date && sprint.end_date && (
                      <div>{`${dayjs(sprint.start_date).format('DD/MM/YYYY')} - ${dayjs(sprint.end_date).format(
                        'DD/MM/YYYY',
                      )}`}</div>
                    )}
                    <div className="sprint-card-notes-icon">
                      <BookOutlined onClick={openSprintNotesModal} style={{ fontSize: '18px' }} />
                    </div>
                    <div className="sprint-card-setting-icon" onClick={(e) => e.stopPropagation()}>
                      <SprintMenu
                        sprintId={sprint.id}
                        projectId={projectId}
                        handleSprintOnClick={handleSprintOnClick}
                      />
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
      {isNotesOpen && <SprintNotesModal isOpen={isNotesOpen} setIsOpen={setIsNotesOpen} sprintId={sprint.id} />}
    </>
  );
}

type SprintListingCardProps = {
  sprint: Sprint;
  setSprint(sprint: Sprint): void;
  setIsModalVisible(isVisible: boolean): void;
};

export default SprintListingCard;
