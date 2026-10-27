import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import '../../mocks/antd';

import CourseCreationModal from './CourseCreationModal';
import store from '../../app/store';
import server from '../../mocks/server';

const mocks = vi.hoisted(() => ({
  featureFlags: undefined as { feature_name: string; active: boolean }[] | undefined,
  autofillCourse: vi.fn(),
}));

vi.mock('../../api/featureFlag', () => ({
  useGetFeatureFlagsQuery: () => ({ data: mocks.featureFlags }),
}));

vi.mock('../../api/ai', () => ({
  useAutofillCourseMutation: () => [mocks.autofillCourse, { isLoading: false }],
}));

describe('test course creation modal', () => {
  // Establish API mocking before all tests.
  beforeAll(() => server.listen());

  // Reset any request handlers that we may add during the tests,
  // so they don't affect other tests.

  afterEach(() => server.resetHandlers());

  // Clean up after the tests are finished.
  afterAll(() => server.close());

  const setup = () => {
    const { baseElement, debug } = render(
      <Provider store={store}>
        <CourseCreationModal />
      </Provider>,
    );
    return { baseElement, debug };
  };

  // Antd modal is rendered outside of `root` div and does not get unmounted after closing
  const expectModalInvisible = async (baseElement: HTMLElement) => {
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    const modalWrapper = baseElement.getElementsByClassName('ant-modal-wrap');
    expect(modalWrapper.length).toBe(1);
    await waitFor(() => expect(modalWrapper[0]).toHaveStyle('display: none'));
  };

  it('should render modal with correct fields', () => {
    const { baseElement } = setup();

    // Open modal
    const button = screen.getByText(/create course/i);
    fireEvent.click(button);

    // Ensure fields are present
    expect(screen.getByLabelText(/course name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/course code/i)).toBeInTheDocument();

    // Compare with snapshot to ensure structure remains the same
    expect(baseElement).toMatchSnapshot();
  });

  it('should require course name', async () => {
    setup();

    const button = screen.getByText(/create course/i);
    fireEvent.click(button);

    const finishButton = await screen.findByText(/finish/i);
    fireEvent.click(finishButton);

    await screen.findByText("Please input your course's name!");
  });

  it('should submit correctly if fields are typed in', async () => {
    const { baseElement } = setup();

    const button = screen.getByText(/create course/i);
    fireEvent.click(button);

    const finishButton = await screen.findByText(/finish/i);

    const nameInput = screen.getByLabelText(/course name/i);
    fireEvent.change(nameInput, { target: { value: 'name' } });

    const courseCodeInput = screen.getByLabelText(/course code/i);
    fireEvent.change(courseCodeInput, { target: { value: 'code' } });

    const yearInput = screen.getByLabelText('Academic Year');
    fireEvent.change(yearInput, { target: { value: '2022' } });

    const semesterInput = screen.getByLabelText('Semester');
    fireEvent.change(semesterInput, { target: { value: '1' } });

    fireEvent.click(finishButton);

    // Modal is closed
    await expectModalInvisible(baseElement);
  });

  describe('AI assist', () => {
    beforeEach(() => {
      mocks.featureFlags = [{ feature_name: 'ai_autofill', active: true }];
      mocks.autofillCourse.mockReset();
    });

    afterAll(() => {
      mocks.featureFlags = undefined;
    });

    const fillWithAi = async (text: string) => {
      fireEvent.click(screen.getByText(/create course/i));
      fireEvent.click(await screen.findByLabelText('AI assist'));
      fireEvent.change(screen.getByLabelText('AI assist input'), { target: { value: text } });
      fireEvent.click(screen.getByText('Fill with AI'));
    };

    it('should not show AI assist when the feature flag is off', async () => {
      mocks.featureFlags = [{ feature_name: 'ai_autofill', active: false }];
      setup();
      fireEvent.click(screen.getByText(/create course/i));

      await screen.findByLabelText(/course name/i);
      expect(screen.queryByLabelText('AI assist')).not.toBeInTheDocument();
    });

    it('should fill only the fields returned by the AI', async () => {
      mocks.autofillCourse.mockReturnValue({
        unwrap: () => Promise.resolve({ courseName: 'Software Engineering', courseCode: 'CS3203' }),
      });
      setup();
      await fillWithAi('CS3203 Software Engineering');

      await waitFor(() => expect(screen.getByLabelText(/course name/i)).toHaveValue('Software Engineering'));
      expect(screen.getByLabelText(/course code/i)).toHaveValue('CS3203');
      expect(mocks.autofillCourse).toHaveBeenCalledWith({ text: 'CS3203 Software Engineering' });
    });

    it('should leave the form untouched when the request fails', async () => {
      mocks.autofillCourse.mockReturnValue({ unwrap: () => Promise.reject(new Error('failed')) });
      setup();
      await fillWithAi('some course');

      await waitFor(() => expect(mocks.autofillCourse).toHaveBeenCalled());
      expect(screen.getByLabelText(/course name/i)).toHaveValue('');
      expect(screen.getByLabelText(/course code/i)).toHaveValue('');
    });
  });
});
