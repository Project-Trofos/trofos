import React from 'react';
import { Button, Card, Input, Steps } from 'antd';
import { useCourse } from '../../api/hooks';
import { Subheading } from '../typography';
import MilestoneCreationModal from '../modals/MilestoneCreationModal';
import { useMilestone } from './useMilestone';
import { DatePicker } from '../datetime';

import './MilestoneCard.css';

const { Step } = Steps;

type MilestoneCardProps = {
  courseId: string | undefined;
  showEdit?: boolean;
};

// Card for displaying and editing milestones of a course
export default function MilestoneCard(props: MilestoneCardProps): JSX.Element {
  const { courseId, showEdit = false } = props;
  const { course, handleDeleteMilestone, handleUpdateMilestone } = useCourse(courseId);
  const { milestones, statuses } = useMilestone(course?.milestones);

  return (
    <Card className="milestone-card">
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: '15px' }}>
        <Subheading>Milestones</Subheading>
        {course && showEdit && <MilestoneCreationModal courseId={course.id.toString()} />}
      </div>
      {milestones && milestones?.length > 0 ? (
        <Steps current={-1}>
          {milestones.map((milestone, index) => {
            return (
              <Step
                key={milestone.id}
                title={
                  <Title showEdit={showEdit} milestone={milestone} handleUpdateMilestone={handleUpdateMilestone} />
                }
                status={statuses[index]}
                description={
                  <Description
                    showEdit={showEdit}
                    milestone={milestone}
                    handleUpdateMilestone={handleUpdateMilestone}
                    handleDeleteMilestone={handleDeleteMilestone}
                  />
                }
              />
            );
          })}
        </Steps>
      ) : (
        <div>No milestones.</div>
      )}
    </Card>
  );
}

function Description(props: {
  showEdit: boolean;
  milestone: NonNullable<ReturnType<typeof useMilestone>['milestones']>[number];
  handleUpdateMilestone: ReturnType<typeof useCourse>['handleUpdateMilestone'];
  handleDeleteMilestone: (milestoneId: number) => Promise<void>;
}): JSX.Element {
  const { handleDeleteMilestone, handleUpdateMilestone, milestone, showEdit } = props;
  return showEdit ? (
    <div>
      <DatePicker.RangePicker
        onCalendarChange={(e) => {
          if (!e) {
            return;
          }
          handleUpdateMilestone(milestone.id, undefined, e[0] ?? undefined, e[1] ?? undefined);
        }}
        size="small"
        value={[milestone.start_date, milestone.deadline]}
        style={{ marginBottom: '5px' }}
      />
      <Button danger size="small" onClick={() => handleDeleteMilestone(milestone.id)}>
        Delete
      </Button>
    </div>
  ) : (
    <div>
      <div>Start Date: {milestone.start_date.format('DD/MM/YYYY')}</div>
      <div>Deadline: {milestone.deadline.format('DD/MM/YYYY')}</div>
    </div>
  );
}

function Title(props: {
  showEdit: boolean;
  milestone: NonNullable<ReturnType<typeof useMilestone>['milestones']>[number];
  handleUpdateMilestone: ReturnType<typeof useCourse>['handleUpdateMilestone'];
}): JSX.Element {
  const { handleUpdateMilestone, milestone, showEdit } = props;
  if (!showEdit) {
    return <div>{milestone.name}</div>;
  }

  return (
    <Input
      key={milestone.id}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          (e.target as typeof e.target & { blur: () => void }).blur();
        }
      }}
      onBlur={(e) => {
        if (e.target.value === milestone.name) {
          return;
        }
        handleUpdateMilestone(milestone.id, e.target.value);
      }}
      size="small"
      defaultValue={milestone.name}
    />
  );
}
