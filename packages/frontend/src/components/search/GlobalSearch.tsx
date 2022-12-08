import React, { useMemo, useRef, useState } from 'react';
import { SearchOutlined } from '@ant-design/icons/lib/icons';
import { AutoComplete, Input, InputRef } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useGetAllCoursesQuery } from '../../api/course';
import { useGetAllProjectsQuery } from '../../api/project';

import './GlobalSearch.css';

export default function GlobalSearch(): JSX.Element {
  const [isInputHidden, setIsInputHidden] = useState(true);
  const [searchString, setSearchString] = useState('');
  const inputRef = useRef<InputRef>(null);

  const navigate = useNavigate();

  const { data: courses } = useGetAllCoursesQuery();
  const { data: projects } = useGetAllProjectsQuery();

  const courseOptions = useMemo(() => {
    if (!courses || searchString.length === 0) {
      return undefined;
    }

    // Filter courses by search string
    const filteredCourses = courses
      .filter((c) => c.cname.toLowerCase().includes(searchString.toLowerCase()))
      .map((c) => renderItem(c.cname, c.id, 'course'));
    if (filteredCourses.length === 0) {
      return undefined;
    }
    return {
      label: renderTitle('Courses'),
      options: filteredCourses,
    };
  }, [courses, searchString]);

  // Filter projects by search string
  const projectOptions = useMemo(() => {
    if (!projects || searchString.length === 0) {
      return undefined;
    }
    const filteredProjects = projects
      .filter((p) => p.pname.toLocaleLowerCase().includes(searchString.toLowerCase()))
      .map((p) => renderItem(p.pname, p.id, 'project'));
    if (filteredProjects.length === 0) {
      return undefined;
    }
    return {
      label: renderTitle('Projects'),
      options: filteredProjects,
    };
  }, [projects, searchString]);

  const allOptions = useMemo(
    () => [...(projectOptions ? [projectOptions] : []), ...(courseOptions ? [courseOptions] : [])],
    [projectOptions, courseOptions],
  );

  const handleClick = () => {
    setIsInputHidden(!isInputHidden);
    if (inputRef) {
      inputRef.current?.focus();
    }
  };

  // TODO: Not sure the type of option
  const handleSelect = (_: string, option: any) => {
    navigate(`${option.type}/${option.type_id}`);
    setSearchString('');
    setIsInputHidden(true);
  };

  const handleBlur = () => {
    if (searchString.length === 0) {
      setIsInputHidden(true);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchString(e.target.value);
  };

  return (
    <div className="search-container">
      <SearchOutlined className="search-icon" onClick={handleClick} />
      <AutoComplete
        className={isInputHidden ? 'search-input-hidden' : 'search-input'}
        options={allOptions}
        value={searchString}
        onSelect={handleSelect}
        notFoundContent={<span>No Result</span>}
        listHeight={200}
      >
        <Input placeholder="type to search" onChange={handleChange} ref={inputRef} onBlur={handleBlur} />
      </AutoComplete>
    </div>
  );
}

const renderTitle = (title: string) => <span>{title}</span>;

const renderItem = (title: string, id: number, type: 'course' | 'project') => ({
  type_id: id,
  type,
  value: title,
  label: <div>{title}</div>,
});
