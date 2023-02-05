import React from 'react';
import { Card, Divider, Form, Input } from 'antd';
import { useGetRetrospectivesQuery } from '../../api/sprint';
import { useAddRetrospectiveMutation } from '../../api/socket/retrospectiveHooks';
import { RetrospectiveType } from '../../api/types';
import RetrospectiveContentCard from './RetrospectiveContentCard';
import './RetrospectiveContainerCard.css';

export default function RetrospectiveContainerCard(props: RetrospectiveContainerCardProps): JSX.Element {
  const { title, type, sprintId } = props;
  const [form] = Form.useForm();

  const { data: retrospectivesData } = useGetRetrospectivesQuery({ sprintId, type });
  const [addRetrospective] = useAddRetrospectiveMutation();

  const handleFormSubmit = async (formData: { content: string }) => {
    const { content } = formData;
    if (!content) return;

    try {
      await addRetrospective({ sprintId, content, type }).unwrap();
      form.resetFields();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Card className="retrospective-container-card" title={title}>
      <div className="retrospective-container-card-body">
        {retrospectivesData?.map((retro) => (
          <RetrospectiveContentCard key={retro.id} retroEntry={retro} />
        ))}
      </div>
      <div className="retrospective-container-card-footer">
        <Divider />
        <Form className="retrospective-container-form" form={form} onFinish={handleFormSubmit}>
          <Form.Item name="content">
            <Input placeholder="Type something here..." />
          </Form.Item>
        </Form>
      </div>
    </Card>
  );
}

type RetrospectiveContainerCardProps = {
  title: string;
  type: RetrospectiveType;
  sprintId: number;
};
