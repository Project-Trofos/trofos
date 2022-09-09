import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import BacklogModal from '../components/modals/BacklogModal';

export default function Backlog(): JSX.Element {
  const params = useParams();

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

      const backlogs = await res.json();
      console.log(backlogs);
      console.log('Success');
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchBacklogs();
  }, []);

  return <BacklogModal />;
}

