import { Typography, Card } from 'antd';

import './StandUpBoard.css';
import StandUpColumn from './StandUpColumn';
import { useGetStandUpNotesQuery } from '../../../api/standup';
import { useParams } from 'react-router-dom';
import { useGetProjectQuery } from '../../../api/project';
import trofosApiSlice from '../../../api';
import useSocket from '../../../api/socket/useSocket';
import { useCallback } from 'react';
import store from '../../../app/store';
import { UpdateType } from '../../../api/socket/socket';

const { Title } = Typography;

export default function StandUpBoard(): JSX.Element {
  const params = useParams();
  const projectId = Number(params.projectId);
  const standUpId = Number(params.standUpId);

  const { data: projectData } = useGetProjectQuery({ id: projectId });
  const users = projectData?.users;
  const { data: standUpNotes } = useGetStandUpNotesQuery({ standUpId: standUpId });

  // Refetch active standup data upon update
  const handleReset = useCallback(() => {
    store.dispatch(trofosApiSlice.util.invalidateTags(['StandUpNote']));
  }, []);
  useSocket(UpdateType.STAND_UP_NOTES, standUpId.toString(), handleReset);

  const columnNames = ["What's Done?", 'What Next?', 'Blockers?'];
  return (
    <>
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
                    standUpId={standUpId}
                    columnData={standUpNotes
                      ?.filter((note) => user.user.user_id == note.userId && note.columnId === index)
                      .sort((a, b) => a.noteId - b.noteId)}
                    userId={user.user.user_id}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </>
  );
}
