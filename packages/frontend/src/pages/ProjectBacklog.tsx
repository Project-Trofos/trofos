import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { List, Typography } from 'antd';
import type { Backlog } from '../api/backlog';
import BacklogModal from '../components/modals/BacklogModal';
import BacklogCard from '../components/cards/BacklogCard';
import './ProjectBacklog.css';

function ProjectBacklog(): JSX.Element {
  const params = useParams();
  const { Title } = Typography;

  const [backlogs, setBacklogs] = useState<Backlog[]>();

  const updateBacklogs = (backlog: Backlog) => {
    setBacklogs([...(backlogs || []), backlog]);
  };

  const fetchBacklogs = async () => {
    try {
      const res = await fetch('http://localhost:3001/backlog/listBacklogs', {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({ projectId: Number(params.projectId) }),
      });

      if (res.status !== 200) {
        console.error('Something went wrong. Please try again');
      }

      const backlogData = await res.json();
      setBacklogs(backlogData);
      console.log(backlogs);
      console.log('Success');
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchBacklogs();
  }, []);

  const renderBacklogCards = (backlog: Backlog) => (
    <List.Item className="backlog-card-container">
      <BacklogCard backlog={backlog} />
    </List.Item>
  );

  return (
    <div className="project-backlog-container">
      <div className="project-backlog-title-container">
        <Title className="project-backlog-title" level={2}>
          Backlogs
        </Title>
        <BacklogModal updateBacklogs={updateBacklogs} />
      </div>
      <List dataSource={backlogs} renderItem={renderBacklogCards} />
    </div>
  );
}

export default ProjectBacklog;
