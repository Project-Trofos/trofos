import React from 'react';
import { render, screen } from '@testing-library/react';

import { BrowserRouter } from 'react-router-dom';
import SprintTable from './SprintTable';
import { MSW_PROJECT, MSW_SPRINT } from '../../mocks/handlers';

describe('test SprintTable', () => {
  const setup = () => {
    const { baseElement, debug } = render(
      <BrowserRouter>
        <SprintTable projects={[MSW_PROJECT]} sprints={MSW_SPRINT} isLoading={false} />
      </BrowserRouter>,
    );
    return { baseElement, debug };
  };

  it('should render table with correct fields', () => {
    const { baseElement } = setup();

    expect(screen.getByText('Sprints')).toBeInTheDocument();

    // Ensure columns are present
    expect(screen.getByText('Project Name')).toBeInTheDocument();
    expect(screen.getByText('Sprint Name')).toBeInTheDocument();
    expect(screen.getByText('End Date')).toBeInTheDocument();
    expect(screen.getByText('Incomplete Issues')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();

    // Compare with snapshot to ensure structure remains the same
    expect(baseElement).toMatchSnapshot();
  });
});
