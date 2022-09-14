import React, { useMemo, useState } from 'react';
import { Form, Input, Segmented, Select, Typography, message } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { useAddProjectMutation } from '../../api/project';
import { useAddProjectAndCourseMutation, useGetAllCoursesQuery } from '../../api/course';
import MultistepFormModal from './MultistepModalForm';
import { useGetAllModulesQuery } from '../../api/nusmods';

const { Option } = Select;


/**
 * Modal for creating projects
 * @param courseId course id that the project will attach to, skips second step
 */
// eslint-disable-next-line react/require-default-props
export default function ProjectCreationModal({ courseId } : { courseId?: string }): JSX.Element {

  const [addProject] = useAddProjectMutation();
  const [addProjectAndCourse] = useAddProjectAndCourseMutation();
  const { data: courses } = useGetAllCoursesQuery();
  const { data: modules } = useGetAllModulesQuery();

  const [form] = Form.useForm();

  const onFinish = (data: { projectName?: string; projectKey?: string; courseName?: string; courseCode?: string }) => {
    const { courseCode, courseName, projectKey, projectName } = data;
    if (!projectName) {
      throw new Error('Invalid data!');
    }

    if (courseCode) {
      addProjectAndCourse({ 
        projectName,
        projectKey,
        courseId: courseCode,
        courseName: courseName
          // Add in names if possible
          ?? (courses?.filter(c => c.id === courseCode)[0])?.cname
          ?? (modules?.filter(m => m.moduleCode === courseCode)[0])?.title,
      }).then(() => {
        message.success(`Project ${projectName} has been created!`);
      }).catch(err => {
        message.error(err);
      });
    } else if (courseId) {
      addProjectAndCourse({ 
        projectName,
        projectKey,
        courseId,
        courseName: courseName
          // Add in names if possible
          ?? (courses?.filter(c => c.id === courseId)[0])?.cname
          ?? (modules?.filter(m => m.moduleCode === courseId)[0])?.title,
      }).then(() => {
        message.success(`Project ${projectName} has been created!`);
      }).catch(err => {
        message.error(err);
      });
    } else {
      addProject({ pname: projectName, pkey: projectKey }).then(() => {
        message.success(`Project ${projectName} has been created!`);
      }).catch(err => {
        message.error(err);
      });
    }
    
  };

  return (
    <MultistepFormModal 
      title='Create Project'
      buttonName='Create Project'
      form={form} formSteps={
        courseId ?
          [<FormStep1 />]
          :
          [<FormStep1 />, <FormStep2 />]
      }
      onSubmit={onFinish}
    />
  );
}

function FormStep1(): JSX.Element {
  return (
    <>
      <p>You can change these details anytime in your project settings.</p>
      <Form.Item
        label="Name"
        name="projectName"
        required
        rules={[{ required: true, message: "Please input your project's name!" }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label="Key"
        name="projectKey"
        rules={[
          { pattern: /^[a-zA-Z0-9-]*$/, message: 'The key must be alphanumeric.' },
          { max: 64, message: 'The key must be at most 64 characters long.' },
        ]}
        tooltip={{ title: 'This key will be used as a prefix to the issues.', icon: <InfoCircleOutlined /> }}
      >
        <Input />
      </Form.Item>
    </>
  );
}


function FormStep2(): JSX.Element {
  const segmentOptions = ['Independent', 'Choose from existing', 'Create new'];
  const { data: courses } = useGetAllCoursesQuery();
  const { data: modules } = useGetAllModulesQuery();
  const [type, setType] = useState<string>('Independent');

  const courseOptions = useMemo(() => {
    const results: JSX.Element[] = [];
    if (modules) {
      results.push(...modules.map(m => 
        <Option key={`${m.moduleCode} ${m.title}`} value={m.moduleCode}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>{m.moduleCode}</span>
            <span>{m.title}</span>
          </div>
        </Option>,
      ));
    }
    if (courses) {
      results.push(...courses.map(c => 
        <Option key={`${c.id} ${c.cname}`} value={c.id}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>{c.id}</span>
            <span>{c.cname}</span>
          </div>
        </Option>,
      ));
    }
    return results;
  }, [courses, modules]);

  return (
    <>
      <p>You can attach this project to a course.</p>
      <Segmented 
        options={segmentOptions}
        style={{ marginBottom: '10px' }}
        onChange={(t) => setType(t.toString())}
      />

      {type === 'Independent' &&
        <Typography>This project will be an independent project.</Typography>
      }

      {type === 'Choose from existing' &&
        <Form.Item
          label="Course"
          name="courseCode"
          rules={[{ required: true, message: 'Please select course!' }]}
        >
          <Select
            showSearch
            placeholder="Search to Select"
            optionFilterProp="children"
            filterOption={(input, option) => {
              if (!option) {
                return false;
              }
              return (option.key as string).toLowerCase().includes(input.toLowerCase());
            }}
          >
            {courseOptions}
          </Select>
        </Form.Item>
      }

      {type === 'Create new' &&
        <>
          <Form.Item
            label="Course Code"
            name="courseCode"
            rules={[{ required: true, message: "Please input your course's code!" }]}
            tooltip={{ title: 'Course code will be used to uniquely identify this course.', icon: <InfoCircleOutlined /> }}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Course Name"
            name="courseName"
            rules={[
              { required: true, message: "Please input your course's name!" },
              { pattern: /^[a-zA-Z0-9-]*$/, message: 'The course name must be alphanumeric.' },
              { max: 64, message: 'The key must be at most 64 characters long.' },
            ]}
          >
            <Input />
          </Form.Item>
        </>
      }
    </>
  );
}
