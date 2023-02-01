import React from 'react';
import { useParams } from 'react-router-dom';
import { useGetUserInfoQuery } from '../api/auth';
import RetrospectiveContainerCard from '../components/cards/RetrospectiveContainerCard';
import './SprintRetrospective.css';

export default function SprintRetrospective(): JSX.Element {
  const params = useParams();
  const { data: userInfo } = useGetUserInfoQuery();

  return (
    <div className="retrospective-container">
      <RetrospectiveContainerCard title="What went well?" type="well" />
      <RetrospectiveContainerCard title="What could we improve?" type="well" />
      <RetrospectiveContainerCard title="Actions for next sprint" type="well" />
    </div>
  );
}
