import { useParams } from 'react-router-dom';
import { Epic } from '../../api/types';
import { Collapse } from 'antd';
import EpicMenu from '../dropdowns/EpicMenu';
import NonDraggableBacklogList from '../lists/NonDraggableBacklogList';
import { useGetBacklogsByEpicIdQuery } from '../../api/backlog';
import './EpicListingCard.css';

function EpicListingCard(props: EpicListingCardProps): JSX.Element {
  const { epic } = props;
  const { Panel } = Collapse;

  const params = useParams();
  const projectId = Number(params.projectId);
  const { data: backlogs } = useGetBacklogsByEpicIdQuery({ epicId: epic.epic_id });

  return (
    <Collapse>
      <Panel
        key={epic.epic_id}
        header={
          <div className="epic-card-inner-container">
            <div className="epic-card-name">{epic.name}</div>
            <div className="epic-card-setting-icon" onClick={(e) => e.stopPropagation()}>
              <EpicMenu epicId={epic.epic_id} projectId={projectId} />
            </div>
          </div>
        }
      >
        <NonDraggableBacklogList backlogs={backlogs} />
      </Panel>
    </Collapse>
  );
}

type EpicListingCardProps = {
  epic: Epic;
};

export default EpicListingCard;
