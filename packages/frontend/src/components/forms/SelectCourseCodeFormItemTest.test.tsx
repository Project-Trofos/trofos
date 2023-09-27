import React from 'react';
import '../../mocks/antd';
import { render, screen } from '@testing-library/react';
import { Select } from 'antd';
import FormWrapper from './__testutils__/FormRenderHelper';
import SelectCourseCodeFormItem from './SelectCourseCodeFormItem';

describe('SelectCourseCodeFormItem test', () => {
  function renderForm() {
    return render(
      <FormWrapper>
        <SelectCourseCodeFormItem
          courseOptions={[
            <Select.Option key="CS3203" value="CS3203">
              CS3203 Software Engineering Project
            </Select.Option>,
            <Select.Option key="CS1010" value="CS1010">
              CS1010 Programming Methodology
            </Select.Option>,
          ]}
        />
      </FormWrapper>,
    );
  }

  describe('when rendering', () => {
    it('should have correct fields', () => {
      const { baseElement } = renderForm();
      expect(baseElement).toMatchSnapshot();

      const select = screen.getByLabelText(/Course/i);

      expect(select).toBeInTheDocument();

      screen.getByText('CS1010', { exact: false });
      screen.getByText('CS3203', { exact: false });
    });
  });
});
