import React from 'react';
import { Typography, Card, Layout } from 'antd';
import StandUpColumn from './StandUpColumn';
import { StandUp } from '../../../api/standup';
import { useGetProjectQuery } from '../../../api/project';
import { useProjectIdParam } from '../../../api/hooks';
import { Heading } from '../../typography';
import dayjs from 'dayjs';
import './StandUpBoard.css';

const { Title } = Typography;
const { Content } = Layout;

type StandUpBoardProps = { standUp: StandUp; readOnly?: boolean };

export const COLUMN_MAPPING = {
  DONE: 0,
  NEXT: 1,
  BLOCKERS: 2,
};

export default function StandUpBoard({ standUp, readOnly }: StandUpBoardProps): JSX.Element {
  const projectId = useProjectIdParam();

  const { data: projectData } = useGetProjectQuery({ id: projectId });
  const users = projectData?.users;

  const columnNames = ["What's Done?", 'What Next?', 'Blockers?'];
  return (
    <Content style={{ overflowX: 'auto' }}>
      <Heading>{dayjs(standUp.date).format('dddd, DD MMM YYYY')}</Heading>
      <div className="standup-board-status-container">
        {columnNames.map((columnName, index) => {
          return (
            <Card bodyStyle={{ padding: '0' }} key={index} className="standup-board-status">
              <Title level={5}>{columnName}</Title>
            </Card>
          );
        })}
      </div>
      {users?.map((user) => {
        return (
          <div key={user.user.user_id} className="standup-board-user-container">
            <Title className="standup-board-user-title" level={5}>
              {user.user.user_display_name}
            </Title>
            <div className="standup-board-droppable">
              {columnNames.map((_, index) => {
                return (
                  <StandUpColumn
                    key={index}
                    columnId={index}
                    standUpId={standUp.id}
                    columnData={standUp.notes
                      .filter((note) => user.user.user_id == note.user_id && note.column_id === index)
                      .sort((a, b) => a.id - b.id)}
                    userId={user.user.user_id}
                    readOnly={readOnly}
                    project_id={projectId}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </Content>
  );
}
