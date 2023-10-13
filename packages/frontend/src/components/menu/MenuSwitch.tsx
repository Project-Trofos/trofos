import { useMatch } from 'react-router-dom';

import CourseMenu from './CourseMenu';
import CoursesMenu from './CoursesMenu';
import ProjectMenu from './ProjectMenu';
import ProjectsMenu from './ProjectsMenu';
/**
 * Main layout of the application.
 */
export default function MenuSwitch() {
  const matchProject = useMatch('/project/:projectId/*');
  const matchProjects = useMatch('/projects/*');
  const matchCourse = useMatch('/course/:courseId/*');
  const matchCourses = useMatch('/courses/*');

  if (matchProject) {
    return <ProjectMenu />;
  } else if (matchProjects) {
    return <ProjectsMenu />;
  } else if (matchCourse) {
    return <CourseMenu />;
  } else if (matchCourses) {
    return <CoursesMenu />;
  }
}
