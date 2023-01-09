import React from 'react';
import { render, screen } from '@testing-library/react';
import AnnouncementCard from './AnnouncementCard';
import { MSW_COURSE } from '../../mocks/handlers';

describe('test AnnouncementCard', () => {
  describe('when rendering', () => {
    it('should render correctly', () => {
      const { baseElement } = render(
        <AnnouncementCard
          handleDeleteAnnouncement={jest.fn()}
          handleUpdateAnnouncement={jest.fn()}
          course={MSW_COURSE}
        />,
      );

      // Title and contents are shown
      for (const announcement of MSW_COURSE.announcements) {
        expect(screen.getByText(announcement.title)).toBeInTheDocument();
        expect(screen.getByText(announcement.content)).toBeInTheDocument();
      }

      // Compare with snapshot to ensure structure remains the same
      expect(baseElement).toMatchSnapshot();
    });
  });
});
