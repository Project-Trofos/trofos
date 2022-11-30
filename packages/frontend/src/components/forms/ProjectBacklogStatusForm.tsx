import React, {useState} from 'react';
import { Form, Input, message } from 'antd';
import { useParams } from 'react-router-dom';
import { BacklogStatusData } from '../../api/types';
import { useUpdateBacklogStatusMutation } from '../../api/project';

export default function ProjectBacklogStatusForm(props: { statuses: Omit<BacklogStatusData, 'projectId'>[] }) {
  const { statuses } = props;

	const [form] = Form.useForm();

	const params = useParams();
	const projectId = Number(params.projectId);

	const [updateBacklogStatus] = useUpdateBacklogStatusMutation();

	// const [initialStatus, setInitialStatus] = useState('');
	// const [updatedStatus, setUpdatedStatus] = useState('');

	const handleBacklogStatusUpdate = async (e: React.FocusEvent<HTMLInputElement, Element>) => {
		if (!e?.target?.id || !e?.target?.value) {
			return;
		}

		const backlogStatusToUpdate = {
			projectId,
			currentName: e.target.id,
			updatedName: e.target.value,
		}

		try {
      await updateBacklogStatus(backlogStatusToUpdate).unwrap();
      message.success({ content: 'Backlog status updated', key: 'backlogStatusUpdateMessage' });
    } catch (err) {
      message.error({ content: 'Failed to update backlog status', key: 'backlogStatusUpdateMessage' });
      console.error(err);
    }
	};

  return (
		<Form
			form={form}
		>
			{statuses.map((status) => (
				<Form.Item
					name={status.name}
					initialValue={status.name}
					key={status.name}
					rules={[{ required: true }]}
				>
					<Input onBlur={handleBacklogStatusUpdate} />
				</Form.Item>
			))}
		</Form>
  );
}
