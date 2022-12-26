import React from 'react';
import { useParams } from 'react-router-dom';
import { useGetActiveSprintQuery } from '../api/sprint';

export default function ScrumBoard(): JSX.Element {
  const params = useParams();
  const projectId = Number(params.projectId);
  const { data: activeSprint } = useGetActiveSprintQuery(projectId);

  return <h1 style={{ margin: 20 }}>Scrum Board Placeholder</h1>;
}
