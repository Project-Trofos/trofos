import React from 'react';
import dayjs from 'dayjs';
import { render, screen } from '@testing-library/react';
import Timestamp from './Timestamp';

describe('test Timestamp', () => {
  describe('when rendering', () => {
    it('should render normal timestamp correctly', () => {
      const { baseElement } = render(<Timestamp createdAt={dayjs('2023-01-01')} updatedAt={undefined} />);

      expect(screen.getByText('01/01/2023', { exact: false })).toBeInTheDocument();

      expect(baseElement).toMatchSnapshot();
    });

    it('should render edited timestamp correctly', () => {
      const { baseElement } = render(<Timestamp createdAt={dayjs('2023-01-01')} updatedAt={dayjs('2023-01-02')} />);

      expect(screen.getByText('02/01/2023', { exact: false })).toBeInTheDocument();
      expect(screen.getByText(/edited/i)).toBeInTheDocument();

      expect(baseElement).toMatchSnapshot();
    });
  });
});
