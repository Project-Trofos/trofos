import React, { useCallback } from 'react';
import { Button, Card, Divider, Form, Input, Space, message } from 'antd';
import './StandUpColumn.css';
import { StandUpNote } from '../../../api/standup';
import { useAddStandUpNoteMutation, useDeleteStandUpNoteMutation } from '../../../api/socket/standUpHooks';
import { DeleteOutlined } from '@ant-design/icons';
import { getErrorMessage } from '../../../helpers/error';
import SimpleCard from '../../cards/SimpleCard';

type StandUpBoardColumnProps = {
  columnData?: StandUpNote[];
  standUpId: number;
  columnId: number;
  userId: number;
};

export default function StandUpColumn(props: StandUpBoardColumnProps): JSX.Element {
  const { columnData, columnId, standUpId, userId } = props;
  const [form] = Form.useForm();

  const [addStandUpNote] = useAddStandUpNoteMutation();

  const handleFormSubmit = async (formData: { content: string }) => {
    const { content } = formData;
    if (!content) return;
    try {
      await addStandUpNote({ stand_up_id: standUpId, content, column_id: columnId, user_id: userId }).unwrap();
    } catch (err) {
      message.error(getErrorMessage(err));
    }
    form.resetFields();
  };
  const [deleteStandUpNote] = useDeleteStandUpNoteMutation();

  const handleOnClick = useCallback(
    (noteId: number) => {
      return async () => {
        try {
          await deleteStandUpNote({ stand_up_id: standUpId, id: noteId }).unwrap();
        } catch (err) {
          message.error(getErrorMessage(err));
        }
      };
    },
    [deleteStandUpNote, standUpId],
  );

  return (
    <Card className="standup-container-card">
      <Space direction="vertical" style={{ width: '100%' }}>
        {columnData?.map((note) => (
          <SimpleCard
            key={note.id}
            content={note.content}
            action={
              <Button type="text">
                <DeleteOutlined onClick={handleOnClick(note.id)} />
              </Button>
            }
          />
        ))}
      </Space>
      <div className="standup-container-card-footer">
        <Divider />
        <Form className="standup-container-form" form={form} onFinish={handleFormSubmit}>
          <Form.Item name="content">
            <Input placeholder="Type something here..." autoComplete="off" />
          </Form.Item>
        </Form>
      </div>
    </Card>
  );
}
