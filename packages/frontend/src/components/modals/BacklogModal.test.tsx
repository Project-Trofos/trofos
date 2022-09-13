import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import BacklogModal from './BacklogModal';

describe('BacklogModal tests', () => {
  it('renders new backlog modal with correct fields', () => {
    const mockUpdateBacklogs = jest.fn();
    const { baseElement } = render(<BacklogModal updateBacklogs={mockUpdateBacklogs} />);
  
    // Open modal
    const button = screen.getByText(/New Backlog/i);
    fireEvent.click(button);
  
    // Ensure fields are present
    expect(screen.getByPlaceholderText('* Type summary here...')).toBeInTheDocument();
    expect(screen.getByLabelText('Type')).toBeInTheDocument();
    expect(screen.getByLabelText('Sprint')).toBeInTheDocument();
    expect(screen.getByLabelText('Priority')).toBeInTheDocument();
    expect(screen.getByLabelText('Reporter')).toBeInTheDocument();
    expect(screen.getByLabelText('Assignee')).toBeInTheDocument();
    expect(screen.getByLabelText('Points')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Description...')).toBeInTheDocument();
  
    // Compare with snapshot to ensure structure remains the same
    expect(baseElement).toMatchSnapshot();
  });
});
