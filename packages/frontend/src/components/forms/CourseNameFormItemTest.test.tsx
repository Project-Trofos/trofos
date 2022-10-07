import React from 'react';
import { render, screen } from '@testing-library/react';
import FormWrapper from './__testutils__/FormRenderHelper.test';
import CourseNameFormItem from './CourseNameFormItem';

describe('CourseNameFormItem test', () => {
  function renderForm() {
    return render(
      <FormWrapper>
        <CourseNameFormItem />
      </FormWrapper>,
    );
  }

  describe('when rendering', () => {
    it('should have correct fields', () => {
      const { baseElement } = renderForm();
      expect(baseElement).toMatchSnapshot();

      expect(screen.getByLabelText(/course name/i)).toBeInTheDocument();
    });
  });
});
