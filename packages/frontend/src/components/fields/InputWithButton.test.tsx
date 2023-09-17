import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import InputWithButton from './InputWithButton';

describe('test InputWithButton', () => {
  describe('when rendering', () => {
    const BUTTON_TEXT = 'ok';
    const PLACEHOLDER = 'placeholder';

    const setup = () => {
      const handleClickFunc = vi.fn();
      const utils = render(
        <InputWithButton handleClick={handleClickFunc} buttonText={BUTTON_TEXT} inputPlaceholder={PLACEHOLDER} />,
      );

      return { ...utils, handleClickFunc };
    };

    it('should render correct fields', () => {
      const { baseElement } = setup();
      // Ensure button is present
      expect(screen.getByText(BUTTON_TEXT)).toBeInTheDocument();

      // Ensure input are present
      expect(screen.getByPlaceholderText(PLACEHOLDER)).toBeInTheDocument();

      // Compare with snapshot to ensure structure remains the same
      expect(baseElement).toMatchSnapshot();
    });

    it('should call function with correct value when button is clicked', () => {
      const { handleClickFunc } = setup();
      const VALUE = 'VALUE';
      const button = screen.getByText(BUTTON_TEXT);
      const input = screen.getByPlaceholderText(PLACEHOLDER);

      fireEvent.change(input, { target: { value: VALUE } });
      fireEvent.click(button);

      expect(handleClickFunc).toHaveBeenCalledTimes(1);
      expect(handleClickFunc).toHaveBeenCalledWith(VALUE);
    });
  });
});
