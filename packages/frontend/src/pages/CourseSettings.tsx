import React, { useState } from 'react';
import { Form, Input, message, Space } from 'antd';
import { useParams } from 'react-router-dom';
import { useUpdateCourseMutation } from '../api/course';
import { useCourse } from '../api/hooks';
import CourseCodeFormItem from '../components/forms/CourseCodeFormItem';
import CourseNameFormItem from '../components/forms/CourseNameFormItem';
import DefaultForm from '../components/forms/DefaultForm';
import Container from '../components/layouts/Container';
import { Subheading } from '../components/typography';
import { getErrorMessage } from '../helpers/error';

export default function CourseSettings(): JSX.Element {
  const params = useParams();
  const { course } = useCourse(params.courseId);

  const [updateCourse] = useUpdateCourseMutation();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleFinish = async (values: { courseName?: string; courseDescription?: string; courseCode: string }) => {
    try {
      if (!course) {
        throw Error('Course is undefined!');
      }
      setIsUpdating(true);
      await updateCourse({
        id: course.id,
        code: values.courseCode,
        description: values.courseDescription,
        cname: values.courseName,
      }).unwrap();
      message.success('Course updated!');
    } catch (error) {
      message.error(getErrorMessage(error));
    }
    setIsUpdating(false);
  };

  return (
    <Container>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Subheading>Course details</Subheading>
        <DefaultForm
          initialValues={{
            courseName: course?.cname,
            courseCode: course?.code,
            courseDescription: course?.description,
          }}
          onFinish={handleFinish as (values: unknown) => void}
          isUpdating={isUpdating}
        >
          <CourseNameFormItem />
          <CourseCodeFormItem />

          <Form.Item label="Description" name="courseDescription">
            <Input.TextArea rows={4} />
          </Form.Item>
        </DefaultForm>
      </Space>
    </Container>
  );
}
