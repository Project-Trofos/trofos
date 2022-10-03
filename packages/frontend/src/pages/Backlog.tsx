import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGetBacklogQuery } from '../api/backlog';
import BacklogSummaryInput from '../components/fields/BacklogSummaryInput';
import BacklogTextArea from '../components/fields/BacklogTextArea';

function Backlog(): JSX.Element {
  const params = useParams();

  const projectId = Number(params.projectId);
  const backlogId = Number(params.backlogId);
  const { data: backlog } = useGetBacklogQuery({ projectId, backlogId });

  const [summary, setSummary] = useState(backlog?.summary);
  const [description, setDescription] = useState(backlog?.description);

  useEffect(() => {
		setSummary(backlog?.summary)
		setDescription(backlog?.description);
	}, [backlog]);
	
	const handleSummaryChange = (e: any) => {
    setSummary(e.target.value);
  };

  const handleDescriptionChange = (e: any) => {
    setDescription(e.target.value);
  };

  if (!backlog) {
    return <h1>Unable to get backlog. Please try again.</h1>;
  }

  return (
    <div>
      <div>
        <BacklogSummaryInput value={summary as string} onChange={handleSummaryChange} />
        <div>
          <p>Description:</p>
          <BacklogTextArea value={description as string} onChange={handleDescriptionChange} />
        </div>
      </div>
    </div>
  );
}

export default Backlog;
