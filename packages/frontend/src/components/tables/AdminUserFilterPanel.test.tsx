import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import user from '@testing-library/user-event';
import '../../mocks/antd';
import AdminUserFilterPanel from './AdminUserFilterPanel';
import { Role } from '../../api/types';

describe('test AdminUserFilterPanel', () => {
  const roles: Role[] = [
    { role_name: 'Faculty', id: 1 },
    { role_name: 'Student', id: 2 },
    { role_name: 'Admin', id: 3 },
  ];

  const projectOptions = [
    { text: 'Group 1 [CS2103T]', value: 10 },
    { text: 'Group 1 [CS3213]', value: 11 },
  ];

  const setup = (filters: Record<string, any> = {}) => {
    const onChange = vi.fn();
    render(
      <AdminUserFilterPanel roles={roles} projectOptions={projectOptions} filters={filters} onChange={onChange} />,
    );
    return { onChange };
  };

  it('renders a Filters button', () => {
    setup();
    expect(screen.getByRole('button', { name: /filters/i })).toBeInTheDocument();
  });

  it('styles the Filters button as a primary (brand-colored) button, not a plain default one', () => {
    setup();
    expect(screen.getByRole('button', { name: /filters/i })).toHaveClass('ant-btn-primary');
  });

  it('opening the panel shows the Role, Projects and Last Active sections', async () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: /filters/i }));

    expect(await screen.findByText('Role')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Last Active')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getByText('Never Logged In')).toBeInTheDocument();
  });

  it('checking a role checkbox calls onChange with that role\'s id', async () => {
    const { onChange } = setup();
    fireEvent.click(screen.getByRole('button', { name: /filters/i }));

    const adminCheckbox = (await screen.findByText('Admin')).closest('label')?.querySelector('input');
    fireEvent.click(adminCheckbox as Element);

    expect(onChange).toHaveBeenCalledWith('role', [3]);
  });

  it('unchecking the only selected role calls onChange with null', async () => {
    const { onChange } = setup({ role: [3] });
    fireEvent.click(screen.getByRole('button', { name: /filters/i }));

    const adminCheckbox = (await screen.findByText('Admin')).closest('label')?.querySelector('input');
    fireEvent.click(adminCheckbox as Element);

    expect(onChange).toHaveBeenCalledWith('role', null);
  });

  it('selecting a project from the searchable select calls onChange with its id', async () => {
    const { onChange } = setup();
    fireEvent.click(screen.getByRole('button', { name: /filters/i }));

    const select = (await screen.findByText('Group 1 [CS2103T]')).closest('select') as HTMLElement;
    await user.selectOptions(select, ['10']);

    // The mocked Select is a native <select> under the hood, whose option
    // values are always strings; the real antd Select preserves the actual
    // number passed in via Select.Option's `value` prop.
    expect(onChange).toHaveBeenCalledWith('projects', ['10']);
  });

  it('checking "Never Logged In" calls onChange with the never-active value', async () => {
    const { onChange } = setup();
    fireEvent.click(screen.getByRole('button', { name: /filters/i }));

    const neverCheckbox = (await screen.findByText('Never Logged In')).closest('label')?.querySelector('input');
    fireEvent.click(neverCheckbox as Element);

    expect(onChange).toHaveBeenCalledWith('last_active', ['never']);
  });

  it('picking a date calls onChange with the "on or before" encoded value', async () => {
    const { onChange } = setup();
    fireEvent.click(screen.getByRole('button', { name: /filters/i }));

    const dateInput = await screen.findByPlaceholderText('Select date');
    fireEvent.change(dateInput, { target: { value: '2026-05-31' } });

    expect(onChange).toHaveBeenCalledWith('last_active', ['before:2026-05-31']);
  });

  it('clicking a preset button calls onChange with a computed cutoff date', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-22T00:00:00.000Z'));

    const { onChange } = setup();
    fireEvent.click(screen.getByRole('button', { name: /filters/i }));

    fireEvent.click(await screen.findByRole('button', { name: '3 Months Ago' }));

    expect(onChange).toHaveBeenCalledWith('last_active', ['before:2026-06-22']);
    vi.useRealTimers();
  });

  it('shows a badge with the count of active filter columns', () => {
    setup({ role: [3], last_active: ['never'] });
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    expect(document.querySelector('.ant-scroll-number, .ant-badge-count')?.textContent).toBe('2');
  });
});
