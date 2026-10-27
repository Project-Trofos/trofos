import React, { useCallback } from 'react';
import { Form, Typography, message } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { useAddCourseMutation } from '../../api/course';
import { useAutofillCourseMutation } from '../../api/ai';
import { useGetFeatureFlagsQuery } from '../../api/featureFlag';
import MultistepFormModal from './MultistepModalForm';
import { getErrorMessage } from '../../helpers/error';
import CourseNameFormItem from '../forms/CourseNameFormItem';
import CourseCodeFormItem from '../forms/CourseCodeFormItem';
import CourseYearSemFormItems from '../forms/CourseYearSemFormItems';
import AiAssist from '../forms/AiAssist';
import { STEP_PROP, StepTarget } from '../tour/TourSteps';

const { Paragraph } = Typography;

/**
 * Modal for creating courses
 */
export default function CourseCreationModal() {
  const [addCourse] = useAddCourseMutation();
  const { data: featureFlags } = useGetFeatureFlagsQuery();
  const isAiAssistEnabled = featureFlags?.some((flag) => flag.feature_name === 'ai_autofill' && flag.active);
  const [autofillCourse] = useAutofillCourseMutation();

  const [form] = Form.useForm();

  const autofill = useCallback(
    async (text: string) => {
      const { courseName, courseCode, courseYear, courseSem } = await autofillCourse({ text }).unwrap();
      const values: Record<string, unknown> = {};
      if (courseName !== undefined) values.courseName = courseName;
      if (courseCode !== undefined) values.courseCode = courseCode;
      if (courseYear !== undefined) values.courseYear = dayjs().year(courseYear);
      if (courseSem !== undefined) values.courseSem = String(courseSem);
      return values;
    },
    [autofillCourse],
  );

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
          {isAiAssistEnabled ? (
            <AiAssist
              autofill={autofill}
              subject="course"
              placeholder="Describe your course, e.g. CS3203 Software Engineering, Academic Year 2025, Semester 2"
            >
              <Paragraph style={{ marginBottom: 0 }}>Please input the details for your course.</Paragraph>
            </AiAssist>
          ) : (
            <Paragraph>Please input the details for your course.</Paragraph>
          )}

          <CourseNameFormItem />

          <CourseCodeFormItem isRequired />

          <CourseYearSemFormItems />
        </>,
      ]}
      buttonType="primary"
      tourProps={{ [STEP_PROP]: StepTarget.CREATE_COURSE_BUTTON }}
    />
  );
}
