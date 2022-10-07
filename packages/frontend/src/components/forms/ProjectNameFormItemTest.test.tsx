import React from 'react';
import { render, screen } from '@testing-library/react';
import FormWrapper from './__testutils__/FormRenderHelper.test';
import ProjectNameFormInput from './ProjectNameFormItem';

describe('ProjectNameFormItem test', () => {
  function renderForm() {
    return render(
      <FormWrapper>
        <ProjectNameFormInput />
      </FormWrapper>,
    );
  }

  describe('when rendering', () => {
    it('should have correct fields', () => {
      const { baseElement } = renderForm();
      expect(baseElement).toMatchSnapshot();

      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    });
  });
});
