import React from 'react';
import { Sprint } from '../../api/sprint';
import { Card } from 'antd';
import Retrospective from '../../pages/Retrospective';
import { Heading } from '../typography';
import './ReportScrum.css';

export function ReportRetrospectiveContainer({ sprint }: { sprint: Sprint }): JSX.Element {
  return (
    <Card style={{ marginBottom: '30px' }}>
      <Heading style={{ marginLeft: '10px' }}>{sprint?.name} Retrospective</Heading>
      <Retrospective sprintId={sprint.id} readOnly />
    </Card>
  );
}
