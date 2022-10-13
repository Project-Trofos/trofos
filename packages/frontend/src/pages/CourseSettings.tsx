import { Button, Form, Input, message, Space } from 'antd';
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useUpdateCourseMutation } from '../api/course';
import { useCourse } from '../api/hooks';
import CourseCodeFormItem from '../components/forms/CourseCodeFormItem';
import CourseNameFormItem from '../components/forms/CourseNameFormItem';
import Container from '../components/layouts/Container';
import { Subheading } from '../components/typography';
import { getErrorMessage } from '../helpers/error';

export default function CourseSettings(): JSX.Element {
  const params = useParams();
  const { course } = useCourse(params.courseId);

  const [updateCourse] = useUpdateCourseMutation();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleFinish = async (values: { courseName?: string; courseDescription?: string }) => {
    try {
      if (!course) {
        throw Error('Course is undefined!');
      }
      setIsUpdating(true);
      await updateCourse({
        id: course.id,
        sem: course.sem,
        year: course.year,
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
        <Form
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 12 }}
          initialValues={{
            courseName: course?.cname,
            courseCode: course?.id,
            courseDescription: course?.description,
          }}
          onFinish={handleFinish}
        >
          <CourseNameFormItem />
          <CourseCodeFormItem isDisabled />

          <Form.Item label="Description" name="courseDescription">
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 6 }}>
            <Button type="primary" htmlType="submit" loading={isUpdating}>
              Update
            </Button>
          </Form.Item>
        </Form>
      </Space>
    </Container>
  );
}
