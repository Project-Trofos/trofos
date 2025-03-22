import React, { useEffect, useState } from 'react';
import { useCurrentAndPastProjects } from '../../api/hooks';
import getPane from '../../helpers/getPane';
import { Divider, Input, Space, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import GenericBoxWithBackground from '../../components/layouts/GenericBoxWithBackground';
import ToggleButtonGroup from '../../components/button/ToggleButtons';
import LoadingComponent from '../../components/common/LoadingComponent';
import CustomPaginationFooter from '../../components/tables/CustomPaginationFooter';

export const sortOptions = {
  SORT_BY_COURSE: 'course',
  SORT_BY_YEAR: 'year',
};

export default function ProjectsBody({
  currentPastOrFuture,
}: {
  currentPastOrFuture: 'cur' | 'past' | 'future';
}): JSX.Element {
  const [searchNameParam, setSearchNameParam] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState(searchNameParam);
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(0);

  const [toggleValue, setToggleValue] = useState<string | null>(null);
  const {
    currentProjects,
    pastProjects,
    futureProjects,
    currentProjectTotalCount,
    pastProjectTotalCount,
    futureProjectTotalCount,
    isLoading
  } = useCurrentAndPastProjects({
    searchNameParam: debouncedSearch,
    sortOption: toggleValue ?? undefined,
    pageIndex,
    pageSize
  });

  const projectsData =
    currentPastOrFuture === 'cur' ? currentProjects : currentPastOrFuture === 'past' ? pastProjects : futureProjects;
  const totalCount =
    currentPastOrFuture === 'cur'
      ? currentProjectTotalCount
      : currentPastOrFuture === 'past'
      ? pastProjectTotalCount
      : futureProjectTotalCount;

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
      <Divider />
      <CustomPaginationFooter
        pageIndex={pageIndex}
        pageSize={pageSize}
        totalRowCount={totalCount ?? 0}
        setPageIndex={setPageIndex}
        setPageSize={setPageSize}
      />
    </GenericBoxWithBackground>
  );
}
