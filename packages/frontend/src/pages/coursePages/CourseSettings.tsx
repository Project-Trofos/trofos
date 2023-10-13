import React, { useState } from 'react';
import { Form, Input, message, Space } from 'antd';
import { useParams } from 'react-router-dom';
import dayjs, { Dayjs } from 'dayjs';
import { useUpdateCourseMutation } from '../../api/course';
import { useCourse } from '../../api/hooks';
import CourseCodeFormItem from '../../components/forms/CourseCodeFormItem';
import CourseNameFormItem from '../../components/forms/CourseNameFormItem';
import DefaultForm from '../../components/forms/DefaultForm';
import Container from '../../components/layouts/Container';
import { Subheading } from '../../components/typography';
import { getErrorMessage } from '../../helpers/error';
import CourseYearSemFormItems from '../../components/forms/CourseYearSemFormItems';

export default function CourseSettings(): JSX.Element {
  const params = useParams();
  const { course } = useCourse(params.courseId);

  const [updateCourse] = useUpdateCourseMutation();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleFinish = async (values: {
    courseName?: string;
    courseDescription?: string;
    courseCode: string;
    courseStartYear: Dayjs;
    courseStartSem: number;
    courseEndYear: Dayjs;
    courseEndSem: number;
  }) => {
    try {
      if (!course) {
        throw Error('Course is undefined!');
      }
      const startYear = values.courseStartYear.year();
      const endYear = values.courseEndYear.year();

      if (startYear > endYear || (startYear === endYear && values.courseStartSem > values.courseEndSem)) {
        throw new Error('Course end date cannot be before start date!');
      }

      setIsUpdating(true);
      await updateCourse({
        id: course.id,
        startYear: values.courseStartYear.year(),
        startSem: values.courseStartSem,
        endYear: values.courseEndYear.year(),
        endSem: values.courseEndSem,
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
            courseStartYear: dayjs().year(course?.startYear ?? 1970),
            courseStartSem: course?.startSem,
            courseEndYear: dayjs().year(course?.endYear ?? 1970),
            courseEndSem: course?.endSem,
          }}
          onFinish={handleFinish as (values: unknown) => void}
          isUpdating={isUpdating}
        >
          <CourseNameFormItem />
          <CourseCodeFormItem />

          <CourseYearSemFormItems
            yearLabel="Start Year"
            semLabel="Start Sem"
            yearName="courseStartYear"
            semName="courseStartSem"
          />

          <CourseYearSemFormItems
            yearLabel="End Year"
            semLabel="End Sem"
            yearName="courseEndYear"
            semName="courseEndSem"
          />

          <Form.Item label="Description" name="courseDescription">
            <Input.TextArea rows={4} />
          </Form.Item>
        </DefaultForm>
      </Space>
    </Container>
  );
}
