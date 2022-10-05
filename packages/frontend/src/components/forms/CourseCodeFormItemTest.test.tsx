import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import CourseCodeFormItem from './CourseCodeFormItem';
import FormWrapper from './__testutils__/FormRenderHelper.test';

describe('CourseCodeFormItem test', () => {
  function renderForm(required?: boolean) {
    return render(
      <FormWrapper>
        <CourseCodeFormItem required={required} />
      </FormWrapper>,
    );
  }

  describe('when rendering', () => {
    it('should have correct fields', () => {
      const { baseElement } = renderForm();
      expect(baseElement).toMatchSnapshot();

      expect(screen.getByLabelText(/course code/i)).toBeInTheDocument();
    });
  });

  describe('when code is required', () => {
    it('should disallow submission', async () => {
      const { baseElement } = renderForm(true);

      // eslint-disable-next-line testing-library/no-node-access
      expect(baseElement.getElementsByClassName('ant-form-item-required').length).toBe(1);

      fireEvent.click(screen.getByText(/submit/i));

      await screen.findByText('Please input', { exact: false });

      // Required prompt disappears upon input
      fireEvent.change(screen.getByLabelText(/course code/i), { target: { value: 'CS3203' } });
      await waitFor(() => expect(screen.queryByText('Please input', { exact: false })).toBeNull());
    });
  });

  describe('when code is not required', () => {
    it('should allow submission', async () => {
      const { baseElement } = renderForm(false);

      // eslint-disable-next-line testing-library/no-node-access
      expect(baseElement.getElementsByClassName('ant-form-item-required').length).toBe(0);
    });
  });
});
