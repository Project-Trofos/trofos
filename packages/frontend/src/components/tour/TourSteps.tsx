import { TourProps } from 'antd';
import { UserRole } from '../../api/auth';

const studentSteps: TourProps['steps'] = [
  {
    title: 'Welcome to the Home Page',
    description: 'This is the home page of the application.',
    target: () => document.getElementById('home-section') as HTMLElement,
  },
  {
    title: 'Navigation Menu',
    description: 'Use the navigation menu to explore other pages.',
    target: () => document.getElementById('nav-menu') as HTMLElement,
  },
];

const facultySteps: TourProps['steps'] = [
  {
    title: 'Dashboard Overview',
    description: 'This is your dashboard. Track your progress here.',
    target: () => document.getElementById('dashboard-section') as HTMLElement,
  },
  {
    title: 'Quick Actions',
    description: 'Perform quick actions from this panel.',
    target: () => document.getElementById('quick-actions') as HTMLElement,
  },
];

const adminSteps: TourProps['steps'] = [];

const steps = { [UserRole.STUDENT]: studentSteps, [UserRole.FACULTY]: facultySteps, [UserRole.ADMIN]: adminSteps };

export function getSteps(role: UserRole | undefined): TourProps['steps'] {
  return role === undefined ? [] : steps[role];
}
