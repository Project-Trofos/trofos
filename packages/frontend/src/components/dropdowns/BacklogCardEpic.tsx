import { useParams } from "react-router-dom";
import { useUpdateBacklogMutation } from "../../api/socket/backlogHooks";
import { message, Select } from "antd";
import { useGetEpicsByProjectIdQuery } from "../../api/backlog";
import './BacklogCardEpic.css';

type BacklogCardEpicProps = {
    backlogId: number;
    currentEpic?: number;
    projectId?: number;
    editable?: boolean;
  };


export default function BacklogCardEpic(props: BacklogCardEpicProps) {
    const { currentEpic, backlogId, projectId, editable = true } = props;
    const params = useParams();
    const [updateBacklog] = useUpdateBacklogMutation();
    const { data: epicData } = useGetEpicsByProjectIdQuery({ projectId: projectId ?? Number(params.projectId) });
  
    const handleEpicChange = async (updatedEpic: number | undefined) => {
      const payload = {
        backlogId,
        projectId: projectId ?? Number(params.projectId),
        fieldToUpdate: {
          epic_id: updatedEpic || null,
        },
      };
  
      try {
        await updateBacklog(payload).unwrap();
        message.success({ content: 'Backlog updated', key: 'backlogUpdateMessage' });
      } catch (e) {
        message.error({ content: 'Failed to update backlog', key: 'backlogUpdateMessage' });
        console.error(e);
      }
    };
  
    return (
      <Select
        className={`backlog-epic`}
        value={currentEpic}
        options={epicData?.map((e) => ({ value: e.epic_id, label: e.name}))}
        onClick={(e) => e.stopPropagation()}
        onChange={handleEpicChange}
        dropdownMatchSelectWidth={false}
        allowClear
        suffixIcon={false}
        placeholder='epic'
        disabled={!editable}
      />
    );
}