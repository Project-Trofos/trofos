import React from 'react';
import { Card, Divider, Form, Input } from 'antd';
import './RetrospectiveContainerCard.css';
import RetrospectiveContentCard from './RetrospectiveContentCard';

const MOCK_RETRO = [
  {
    id: 0,
    content: 'We did well in the discussion and execution of the backlogs this week',
    type: 'well',
    votes: [],
    score: 3,
  },
  {
    id: 1,
    content: 'We did well in the discussion and execution of the backlogs this week',
    type: 'well',
    votes: [
      {
        id: 0,
        retro_id: 0,
        user_id: 3,
        type: 'down',
      },
    ],
    score: 1,
  },
  {
    id: 2,
    content: 'We did well in the discussion and execution of the backlogs this week',
    type: 'well',
    votes: [
      {
        id: 2,
        retro_id: 0,
        user_id: 3,
        type: 'up',
      },
    ],
    score: 3,
  },
  {
    id: 3,
    content: 'We did well in the discussion and execution of the backlogs this week',
    type: 'well',
    votes: [
      {
        id: 2,
        retro_id: 0,
        user_id: 3,
        type: 'up',
      },
    ],
    score: 3,
  },
  {
    id: 4,
    content: 'We did well in the discussion and execution of the backlogs this week',
    type: 'well',
    votes: [],
    score: 3,
  },
];

export default function RetrospectiveContainerCard(props: RetrospectiveContainerCardProps): JSX.Element {
  const { title, type } = props;

  const handleFormSubmit = (formData: any) => {
    console.log(formData);
  };

  return (
    <Card className="retrospective-container-card" title={title}>
      {MOCK_RETRO.map((retro) => (
        <RetrospectiveContentCard key={retro.id} retroEntry={retro} />
      ))}
      <Divider />
      <Form className="retrospective-container-form" onFinish={handleFormSubmit}>
        <Form.Item name="content">
          <Input placeholder="Type something here..." />
        </Form.Item>
      </Form>
    </Card>
  );
}

type RetrospectiveContainerCardProps = {
  title: string;
  type: string;
};
