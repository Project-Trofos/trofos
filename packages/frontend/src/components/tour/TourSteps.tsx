import { TourProps } from 'antd';
import { UserRole } from '../../api/auth';

const studentSteps: TourProps['steps'] = [
  {
    title: 'Welcome to the Home Page',
    description: 'This is the home page of the application.',
    // target: () => document.getElementById('home-section') as HTMLElement,
  },
  {
    title: 'Navigation Menu',
    description: 'Use the navigation menu to explore other pages.',
    // target: () => document.getElementById('nav-menu') as HTMLElement,
  },
];

const facultySteps: TourProps['steps'] = [
  {
    title: 'Dashboard Overview',
    description: 'This is your dashboard. Track your progress here.',
    // target: () => document.getElementById('dashboard-section') as HTMLElement,
  },
  {
    title: 'Quick Actions',
    description: 'Perform quick actions from this panel.',
    // target: () => document.getElementById('quick-actions') as HTMLElement,
  },
];

const adminSteps: TourProps['steps'] = [
  {
    title: 'Admin Dashboard',
    description:
      'This dashboard gives you an overview of platform activity, including user statistics and system metrics.',
    // target: () => document.getElementById('admin-dashboard') as HTMLElement,
  },
  {
    title: 'User Management',
    description: 'Manage platform users here. You can add, remove, or modify user information and roles.',
    // target: () => document.getElementById('user-management') as HTMLElement,
  },
  {
    title: 'Reports and Analytics',
    description: 'View detailed reports on application usage, performance metrics, and activity logs.',
    // target: () => document.getElementById('reports-section') as HTMLElement,
  },
  {
    title: 'Settings',
    description: 'Configure system-wide settings, including application preferences and security options.',
    // target: () => document.getElementById('settings-section') as HTMLElement,
  },
  {
    title: 'Notifications Panel',
    description: 'Keep track of important alerts and announcements from this panel.',
    // target: () => document.getElementById('notifications-panel') as HTMLElement,
  },
];

const steps = { [UserRole.STUDENT]: studentSteps, [UserRole.FACULTY]: facultySteps, [UserRole.ADMIN]: adminSteps };

export function getSteps(role: UserRole | undefined): TourProps['steps'] {
  return role === undefined ? [] : steps[role];
}
