import React, { useCallback } from 'react';
import { Form, Typography, message } from 'antd';
import { Dayjs } from 'dayjs';
import { useAddCourseMutation } from '../../api/course';
import { useGetFeatureFlagsQuery } from '../../api/featureFlag';
import MultistepFormModal from './MultistepModalForm';
import { getErrorMessage } from '../../helpers/error';
import CourseNameFormItem from '../forms/CourseNameFormItem';
import CourseCodeFormItem from '../forms/CourseCodeFormItem';
import CourseYearSemFormItems from '../forms/CourseYearSemFormItems';
import CourseAiAssist from '../forms/CourseAiAssist';
import { STEP_PROP, StepTarget } from '../tour/TourSteps';

const { Paragraph } = Typography;

/**
 * Modal for creating courses
 */
export default function CourseCreationModal() {
  const [addCourse] = useAddCourseMutation();
  const { data: featureFlags } = useGetFeatureFlagsQuery();
  const isAiAssistEnabled = featureFlags?.some((flag) => flag.feature_name === 'ai_course_autofill' && flag.active);

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
          {isAiAssistEnabled ? (
            <CourseAiAssist>
              <Paragraph style={{ marginBottom: 0 }}>Please input the details for your course.</Paragraph>
            </CourseAiAssist>
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
