import React, { useCallback } from 'react';
import { Button } from 'antd';
import { useGetSprintsByProjectIdQuery } from '../../api/sprint';
import { Project } from '../../api/types';
import { generateWordDocument } from './generateDocumentHooks';

export default function DownloadReport({ project }: { project: Project }): React.ReactElement {
  // const retrieveAllData = useCallback(() => {
  //   const { data: sprintsData } = useGetSprintsByProjectIdQuery(project.id);
  // }, [project.id]);
  return (
    <Button type="primary" onClick={generateWordDocument}>
      Download Report
    </Button>
  );
}
