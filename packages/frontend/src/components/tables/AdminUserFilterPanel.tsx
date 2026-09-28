import React, { useRef, useState } from 'react';
import { Button, Popover, Checkbox, Select, DatePicker, Space, Typography, Divider, Badge } from 'antd';
import type { FilterValue } from 'antd/es/table/interface';
import dayjs from 'dayjs';
import { Role } from '../../api/types';

export const LAST_ACTIVE_NEVER = 'never';
export const LAST_ACTIVE_BEFORE_PREFIX = 'before:';

export type ProjectFilterOption = { text: string; value: number };

type AdminUserFilterPanelProps = {
  roles: Role[] | undefined;
  projectOptions: ProjectFilterOption[];
  filters: Record<string, FilterValue | null>;
  onChange: (key: string, value: FilterValue | null) => void;
};

const FILTER_KEYS = ['role', 'projects', 'last_active'];

export default function AdminUserFilterPanel({
  roles,
  projectOptions,
  filters,
  onChange,
}: AdminUserFilterPanelProps): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  // Select/DatePicker render their dropdown into a document.body portal by
  // default, so a click inside that dropdown looks like an "outside click" to
  // the parent Popover and closes it. Rendering their popups inside the
  // panel's own container fixes that.
  const containerRef = useRef<HTMLDivElement>(null);
  const getPopupContainer = () => containerRef.current || document.body;

  const activeCount = FILTER_KEYS.filter((key) => filters[key] && filters[key]!.length > 0).length;

  const lastActiveValue = filters.last_active?.[0]?.toString();
  const isNever = lastActiveValue === LAST_ACTIVE_NEVER;
  const dateValue = lastActiveValue?.startsWith(LAST_ACTIVE_BEFORE_PREFIX)
    ? lastActiveValue.slice(LAST_ACTIVE_BEFORE_PREFIX.length)
    : undefined;

  const applyDate = (dateStr: string | undefined) => {
    onChange('last_active', dateStr ? [`${LAST_ACTIVE_BEFORE_PREFIX}${dateStr}`] : null);
  };
  const applyPreset = (monthsAgo: number) => applyDate(dayjs().subtract(monthsAgo, 'month').format('YYYY-MM-DD'));

  const content = (
    <div data-testid='admin-user-filter-panel' style={{ width: 300, position: 'relative' }} ref={containerRef}>
      <Typography.Text strong>Role</Typography.Text>
      <div style={{ margin: '4px 0 12px' }}>
        <Checkbox.Group
          style={{ display: 'flex', flexDirection: 'column', rowGap: 4 }}
          value={filters.role ?? []}
          options={roles?.map((role) => ({ label: role.role_name, value: role.id }))}
          onChange={(values) => onChange('role', values.length ? (values as FilterValue) : null)}
        />
      </div>

      <Typography.Text strong>Projects</Typography.Text>
      <div style={{ margin: '4px 0 12px' }}>
        <Select
          id='admin-user-projects-filter'
          mode='multiple'
          showSearch
          allowClear
          getPopupContainer={getPopupContainer}
          style={{ width: '100%' }}
          placeholder='Search projects...'
          value={filters.projects ?? []}
          optionFilterProp='children'
          onChange={(values) => onChange('projects', (values as number[]).length ? (values as FilterValue) : null)}
        >
          {projectOptions.map((option) => (
            <Select.Option key={option.value} value={option.value}>
              {option.text}
            </Select.Option>
          ))}
        </Select>
      </div>

      <Typography.Text strong>Last Active</Typography.Text>
      <div style={{ margin: '4px 0' }}>
        <Checkbox
          checked={isNever}
          onChange={(e) => onChange('last_active', e.target.checked ? [LAST_ACTIVE_NEVER] : null)}
        >
          Never Logged In
        </Checkbox>
        <Divider style={{ margin: '8px 0' }} />
        <Typography.Text style={{ display: 'block', marginBottom: 4 }}>Last active on or before:</Typography.Text>
        <DatePicker
          getPopupContainer={getPopupContainer}
          style={{ width: '100%', marginBottom: 8 }}
          disabled={isNever}
          placeholder='Select date'
          value={dateValue ? dayjs(dateValue) : null}
          onChange={(date) => applyDate(date ? date.format('YYYY-MM-DD') : undefined)}
        />
        <Space wrap>
          <Button size='small' disabled={isNever} onClick={() => applyPreset(3)}>
            3 Months Ago
          </Button>
          <Button size='small' disabled={isNever} onClick={() => applyPreset(6)}>
            6 Months Ago
          </Button>
          <Button size='small' disabled={isNever} onClick={() => applyPreset(12)}>
            1 Year Ago
          </Button>
        </Space>
      </div>
    </div>
  );

  return (
    <Popover trigger='click' placement='bottomLeft' content={content} open={isOpen} onOpenChange={setIsOpen}>
      <Badge count={activeCount} size='small' offset={[-4, 4]}>
        <Button type='primary'>Filters</Button>
      </Badge>
    </Popover>
  );
}
