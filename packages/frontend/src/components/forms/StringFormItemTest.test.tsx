import React from 'react';
import { render, screen } from '@testing-library/react';
import FormWrapper from './__testutils__/FormRenderHelper.test';
import StringFormItem from './StringFormItem';

describe('SelectCourseCodeFormItem test', () => {
  const LABEL = 'LABEL';
  const NAME = 'NAME';

  function renderForm() {
    return render(
      <FormWrapper>
        <StringFormItem label={LABEL} name={NAME} />
      </FormWrapper>,
    );
  }

  describe('when rendering', () => {
    it('should have correct fields', () => {
      const { baseElement } = renderForm();
      expect(baseElement).toMatchSnapshot();
      const select = screen.getByLabelText(LABEL);
      expect(select).toBeInTheDocument();
    });
  });
});
