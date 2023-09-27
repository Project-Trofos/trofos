import { render, screen } from '@testing-library/react';
import React from 'react';
import UserEmailFormItem from './UserEmailFormItem';
import FormWrapper from './__testutils__/FormRenderHelper';

describe('UserEmailFormItem test', () => {
  function renderForm() {
    return render(
      <FormWrapper>
        <UserEmailFormItem />
      </FormWrapper>,
    );
  }

  describe('when rendering', () => {
    it('should have the correct fields', () => {
      const { baseElement } = renderForm();
      expect(baseElement).toMatchSnapshot();

      const select = screen.getByLabelText(/User Email/i);

      expect(select).toBeInTheDocument();
    });
  });
});
