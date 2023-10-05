import { useMatch } from 'react-router-dom';

import CourseMenu from './CourseMenu';
import ProjectMenu from './ProjectMenu';

/**
 * Main layout of the application.
 */
export default function MenuSwitch() {
  const matchProject = useMatch('/project/:projectId/*');
  const matchCourse = useMatch('/course/:courseId/*');
  if (matchProject) {
    return <ProjectMenu />;
  } else if (matchCourse) {
    return <CourseMenu />;
  }
}
