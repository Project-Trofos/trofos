import React, { useEffect, useState } from 'react';
import { useCurrentAndPastProjects } from '../../api/hooks';
import getPane from '../../helpers/getPane';
import { Input, Space, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import GenericBoxWithBackground from '../../components/layouts/GenericBoxWithBackground';
import ToggleButtonGroup from '../../components/button/ToggleButtons';
import LoadingComponent from '../../components/common/LoadingComponent';

export const sortOptions = {
  SORT_BY_COURSE: 'Sort by Course',
  SORT_BY_YEAR: 'Sort by Year',
};

export default function ProjectsBody({
  currentPastOrFuture,
}: {
  currentPastOrFuture: 'cur' | 'past' | 'future';
}): JSX.Element {
  const [searchNameParam, setSearchNameParam] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState(searchNameParam);
  const [toggleValue, setToggleValue] = useState<string | null>(null);
  const { currentProjects, pastProjects, futureProjects, isLoading } = useCurrentAndPastProjects({
    searchNameParam: debouncedSearch,
    sortOption: toggleValue ?? undefined,
  });

  const projectsData =
    currentPastOrFuture === 'cur' ? currentProjects : currentPastOrFuture === 'past' ? pastProjects : futureProjects;

  const noProjectsText = currentPastOrFuture === 'cur' ? 'current' : currentPastOrFuture === 'past' ? 'past' : 'future';
  const tooltipText = <>Independent projects are always sorted to the rear</>;

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
        <Space>
          <Tooltip title={tooltipText}>
            <QuestionCircleOutlined style={{ color: 'grey', fontSize: 16 }} />
          </Tooltip>
          <ToggleButtonGroup
            titles={[sortOptions.SORT_BY_COURSE, sortOptions.SORT_BY_YEAR]}
            onToggle={setToggleValue}
          />
        </Space>
      </div>
      {isLoading ? <LoadingComponent /> : getPane(projectsData, `There are no ${noProjectsText} projects.`)}
    </GenericBoxWithBackground>
  );
}
