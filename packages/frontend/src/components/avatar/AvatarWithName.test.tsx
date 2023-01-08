import React from 'react';
import { render, screen } from '@testing-library/react';
import AvatarWithName from './AvatarWithName';

describe('test Avatar', () => {
  describe('when rendering', () => {
    it('should render correctly', () => {
      const ICON = <div>icon</div>;
      const USERNAME = 'username1';
      const { baseElement } = render(<AvatarWithName icon={ICON} username={USERNAME} />);

      // Ensure fields are present
      expect(screen.getByText('icon')).toBeInTheDocument();
      expect(screen.getByText(USERNAME)).toBeInTheDocument();

      // Compare with snapshot to ensure structure remains the same
      expect(baseElement).toMatchSnapshot();
    });
  });
});
