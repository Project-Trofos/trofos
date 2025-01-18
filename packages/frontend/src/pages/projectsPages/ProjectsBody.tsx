import React, { useEffect, useState } from 'react';
import { useCurrentAndPastProjects } from '../../api/hooks';
import getPane from '../../helpers/getPane';
import { Input, Spin, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import GenericBoxWithBackground from '../../components/layouts/GenericBoxWithBackground';

export default function ProjectsBody({
  currentPastOrFuture,
}: {
  currentPastOrFuture: 'cur' | 'past' | 'future';
}): JSX.Element {
  const [searchNameParam, setSearchNameParam] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState(searchNameParam);
  const { currentProjects, pastProjects, futureProjects, isLoading } = useCurrentAndPastProjects({
    searchNameParam: debouncedSearch,
  });

  const projectsData =
    currentPastOrFuture === 'cur' ? currentProjects : currentPastOrFuture === 'past' ? pastProjects : futureProjects;

  const noProjectsText = currentPastOrFuture === 'cur' ? 'current' : currentPastOrFuture === 'past' ? 'past' : 'future';
  const tooltipText = (
    <>
      Projects are sorted in the order: <br />
      Course Year/Sem &gt; Course Name &gt; Project Name
    </>
  );

  // Debounce the search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchNameParam);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchNameParam]);

  return (
    <GenericBoxWithBackground style={{ minHeight: '40vh' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
        }}
      >
        <Input
          placeholder="Search Project by name"
          value={searchNameParam}
          onChange={(e) => {
            setSearchNameParam(e.target.value);
          }}
          style={{ maxWidth: '30%' }}
        />

        <Tooltip placement="left" title={tooltipText}>
          <QuestionCircleOutlined style={{ color: 'grey', fontSize: 16 }} />
        </Tooltip>
      </div>
      {isLoading ? <Spin /> : getPane(projectsData, `There are no ${noProjectsText} projects.`)}
    </GenericBoxWithBackground>
  );
}
