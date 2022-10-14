import React from 'react';
import { render, screen } from '@testing-library/react';
import FormWrapper from './__testutils__/FormRenderHelper.test';
import OldPasswordFormItem from './OldPasswordFormItem';

describe('OldPasswordFormItem test', () => {
  function renderForm() {
    return render(
      <FormWrapper>
        <OldPasswordFormItem />
      </FormWrapper>,
    );
  }

  describe('when rendering', () => {
    it('should have an old password field', () => {
      const { baseElement } = renderForm();
      expect(baseElement).toMatchSnapshot();

      expect(screen.getByLabelText(/old password/i)).toBeInTheDocument();
    });
  });
});
