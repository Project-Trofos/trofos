import React from 'react';
import { fireEvent, getByText, queryByText, render, screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react';
import { Provider } from 'react-redux';

import { Select as AntdSelect } from 'antd';
import ProjectCreationModal from './ProjectCreationModal';
import store from '../../app/store';
import server from '../../mocks/server';

jest.mock('antd', () => {
  const antd = jest.requireActual('antd');

  function Select(props: React.ComponentProps<typeof AntdSelect>) {

    const { mode, value, defaultValue, className, onChange, disabled, children } = props;

    const multiple = ['tags', 'multiple'].includes(mode ?? '');

    return (
      <select
        value={value as React.SelectHTMLAttributes<HTMLSelectElement>['value']}
        defaultValue={defaultValue as React.SelectHTMLAttributes<HTMLSelectElement>['defaultValue']}
        multiple={multiple}
        disabled={disabled}
        className={className}
        onChange={e => {
          if (onChange) {
            onChange(multiple ? Array.from(e.target.selectedOptions).map((option) => option.value) : e.target.value, {});
          }
        }}
      >
        {children}
      </select>
    );
  }

  Select.Option = function ({ children, ...otherProps }: { children: React.ReactNode }) {
    return <option {...otherProps}>{children}</option>;
  };
  Select.OptGroup = function ({ children, ...otherProps }: { children: React.ReactNode }) {
    return <optgroup {...otherProps}>{children}</optgroup>;
  };

  return { ...antd, Select };
});

describe('test ProjectCreationModal', () => {

  // Establish API mocking before all tests.
  beforeAll(() => server.listen());

  // Reset any request handlers that we may add during the tests,
  // so they don't affect other tests.

  afterEach(() => server.resetHandlers());

  // Clean up after the tests are finished.
  afterAll(() => server.close());

  const setup = async () => {
    const { baseElement, debug } = render(<Provider store={store}><ProjectCreationModal /></Provider>);

    return { baseElement, debug };
  };

  const goToSecondStep = async () => {
    const setupData = await setup();
    const button = screen.getByText('Create Project');
    fireEvent.click(button);

    const nextButton = await screen.findByText('Next');
    const pnameInput = screen.getByLabelText('Name');

    fireEvent.change(pnameInput, { target: { value: 'pname' } });
    fireEvent.click(nextButton);

    await screen.findByText('You can attach this project to a course.');

    return setupData;
  };

  it('should render modal with correct fields', async () => {
    const { baseElement } = await setup();

    // Open modal
    const button = screen.getByText(/create project/i);
    fireEvent.click(button);

    // Ensure fields are present
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Key')).toBeInTheDocument();

    // Compare with snapshot to ensure structure remains the same
    expect(baseElement).toMatchSnapshot();
  });


  it('should be require project name', async () => {
    await setup();

    const button = screen.getByText('Create Project');
    fireEvent.click(button);

    const nextButton = await screen.findByText('Next');
    fireEvent.click(nextButton);

    await screen.findByText('Please input your project\'s name!');
  });

  it('should be able to go to second step', async () => {
    await goToSecondStep();
  });

  it('should allow skipping course step by selecting independent project', async () => {
    await goToSecondStep();
    const segment = screen.getByText('Independent');
    fireEvent.click(segment);

    const finishButton = screen.getByText('Finish');
    fireEvent.click(finishButton);

    await waitForElementToBeRemoved(() => screen.queryByText(/Finish/i));
  });

  // Can't get this test to work
  it('should allow choosing a course from existing courses', async () => {
    await goToSecondStep();
    const segment = screen.getByText(/existing/i);
    fireEvent.click(segment);

    const input = await screen.findByRole('combobox');
    fireEvent.click(input);

    fireEvent.change(input, { target: { value: 'CS3203' } });

    const finishButton = screen.getByText('Finish');
    fireEvent.click(finishButton);

    await waitForElementToBeRemoved(() => screen.queryByText(/Finish/i));
  });

  it('should submit correctly if fields are typed in', async () => {
    await goToSecondStep();

    const segment = screen.getByText(/create new/i);
    fireEvent.click(segment);

    const codeInput = screen.getByLabelText('Course Code');
    fireEvent.change(codeInput, { target: { value: 'code' } });

    const nameInput = screen.getByLabelText('Course Name');
    fireEvent.change(nameInput, { target: { value: 'name' } });

    const finishButton = screen.getByText('Finish');
    fireEvent.click(finishButton);
    
    // Modal is closed
    await waitFor(() => expect(screen.queryByText('You can attach this project to a course.')).toBeNull());
  });

});