import React, { useCallback } from 'react';
import { Form, Typography, message } from 'antd';
import { Dayjs } from 'dayjs';
import { useAddCourseMutation } from '../../api/course';
import MultistepFormModal from './MultistepModalForm';
import { getErrorMessage } from '../../helpers/error';
import CourseNameFormItem from '../forms/CourseNameFormItem';
import CourseCodeFormItem from '../forms/CourseCodeFormItem';
import CourseYearSemFormItems from '../forms/CourseYearSemFormItems';

const { Paragraph } = Typography;

/**
 * Modal for creating courses
 */
export default function CourseCreationModal() {
  const [addCourse] = useAddCourseMutation();

  const [form] = Form.useForm();

  const onFinish = useCallback(
    async (values: { courseCode: string; courseYear: Dayjs; courseSem: string; courseName: string }) => {
      try {
        const { courseCode, courseName, courseSem, courseYear } = values;

        await addCourse({
          code: courseCode.trim(),
          startYear: Number(courseYear.year()),
          startSem: Number(courseSem),
          endYear: Number(courseYear.year()),
          endSem: Number(courseSem),
          cname: courseName.trim(),
        }).unwrap();
        message.success(`Course ${values.courseName} has been created!`);
      } catch (err) {
        message.error(getErrorMessage(err));
        throw err;
      }
    },
    [addCourse],
  );

  return (
    <MultistepFormModal
      title="Create Course"
      buttonChildren="Create Course"
      form={form}
      onSubmit={onFinish}
      formSteps={[
        <>
          <Paragraph>Please input the details for your course.</Paragraph>

          <CourseNameFormItem />

          <CourseCodeFormItem isRequired />

          <CourseYearSemFormItems />
        </>,
      ]}
      buttonType="primary"
    />
  );
}
