import React from 'react';
import { render, screen } from '@testing-library/react';
import FormWrapper from './__testutils__/FormRenderHelper.test';
import CourseYearSemFormItems from './CourseYearSemFormItems';

describe('CourseYearSemesterFormItem test', () => {
  function renderForm() {
    return render(
      <FormWrapper>
        <CourseYearSemFormItems />
      </FormWrapper>,
    );
  }

  describe('when rendering', () => {
    it('should have correct fields', () => {
      const { baseElement } = renderForm();
      expect(baseElement).toMatchSnapshot();

      expect(screen.getByLabelText(/academic year/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/semester/i)).toBeInTheDocument();
    });
  });
});
