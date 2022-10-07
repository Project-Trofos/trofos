import React from 'react';
import { render, screen } from '@testing-library/react';
import FormWrapper from './__testutils__/FormRenderHelper.test';
import ProjectKeyFormInput from './ProjectKeyFormItem';

describe('ProjectKeyFormItem test', () => {
  function renderForm(isDisabled?: boolean) {
    return render(
      <FormWrapper>
        <ProjectKeyFormInput isDisabled={isDisabled} />
      </FormWrapper>,
    );
  }

  describe('when rendering', () => {
    it('should have correct fields', () => {
      const { baseElement } = renderForm();
      expect(baseElement).toMatchSnapshot();

      expect(screen.getByLabelText(/Key/i)).toBeInTheDocument();
    });
  });

  describe('if disabled', () => {
    it('should be shown as disabled', () => {
      renderForm(true);

      expect(screen.getByLabelText(/Key/i)).toBeDisabled();
    });
  });
});
