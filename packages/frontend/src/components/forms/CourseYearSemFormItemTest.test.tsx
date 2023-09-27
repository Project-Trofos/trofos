import React from 'react';
import { render, screen } from '@testing-library/react';
import FormWrapper from './__testutils__/FormRenderHelper';
import CourseYearSemFormItems from './CourseYearSemFormItems';

describe('CourseYearSemesterFormItem test', () => {
  function renderForm(yearName?: string, yearLabel?: string, semName?: string, semLabel?: string) {
    return render(
      <FormWrapper>
        <CourseYearSemFormItems yearName={yearName} yearLabel={yearLabel} semName={semName} semLabel={semLabel} />
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

    it('should allow changing of label and name', () => {
      const YEAR_NAME = 'year';
      const YEAR_LABEL = YEAR_NAME;
      const SEM_NAME = 'sem';
      const SEM_LABEL = SEM_NAME;
      renderForm(YEAR_NAME, YEAR_LABEL, SEM_NAME, SEM_LABEL);

      expect(screen.getByLabelText(YEAR_LABEL)).toBeInTheDocument();
      expect(screen.getByLabelText(SEM_LABEL)).toBeInTheDocument();
    });
  });
});
