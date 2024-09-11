import React from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import MainLayout from '../templates/MainLayout';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Project from '../pages/projectPages/Project';
import Projects from '../pages/projectsPages/Projects';
import Courses from '../pages/coursesPages/Courses';
import Course from '../pages/coursePages/Course';
import Backlog from '../pages/Backlog';
import Account from '../pages/Account';
import Admin from '../pages/Admin';

import ProjectOverview from '../pages/projectPages/ProjectOverview';
import ProjectBacklogs from '../pages/projectPages/ProjectBacklogs';
import ScrumBoard, { SprintScrumBoardPage } from '../pages/projectPages/ScrumBoardPage';

import './App.css';
import ProjectSettings from '../pages/projectPages/ProjectSettings';
import CourseOverview from '../pages/coursePages/CourseOverview';
import CourseSettings from '../pages/coursePages/CourseSettings';
import ProjectSprints from '../pages/projectPages/ProjectSprints';
import CoursePeople from '../pages/coursePages/CoursePeople';
import ProjectPeople from '../pages/projectPages/ProjectPeople';
import Retrospective from '../pages/Retrospective';
import ProjectFeedbacks from '../pages/projectPages/ProjectFeedbacks';
import CourseStatistics from '../pages/coursePages/CourseStatistics';
import { AdminProtected, CourseManagerProtected } from '../helpers/ProtectedRoute';
import CourseMilestones from '../pages/coursePages/CourseMilestones';
import Callback from '../pages/Callback';
import ProjectStatistics from '../pages/projectPages/ProjectStatistics';
import CurrentProjects from '../pages/projectsPages/CurrentProjects';
import PastProjects from '../pages/projectsPages/PastProjects';
import FutureProjects from '../pages/projectsPages/FutureProjects';
import CurrentCourses from '../pages/coursesPages/CurrentCourses';
import PastCourses from '../pages/coursesPages/PastCourses';
import FutureCourses from '../pages/coursesPages/FutureCourses';
import ThemeProvider from '../components/theming/ThemeProvider';
import StandUpBoardPage from '../pages/projectPages/StandUpBoardPage';
import StandUpsPage from '../pages/projectPages/StandUpsPage';
import Register from '../pages/Register';
import useMessage from 'antd/es/message/useMessage';
import { ProjectReportPage } from '../pages/projectPages/ProjectReportPage';
import Invite from '../pages/Invite';

function App() {
  const [_, contextHolder] = useMessage();
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route path="" element={<Home />} />
            <Route path="projects" element={<Projects />}>
              <Route path="" element={<Navigate to="current" />} />
              <Route path="current" element={<CurrentProjects />} />
              <Route path="past" element={<PastProjects />} />
              <Route path="future" element={<FutureProjects />} />
            </Route>
            <Route path="project/:projectId" element={<Project />}>
              <Route path="" element={<Navigate to="overview" />} />
              <Route path="overview" element={<ProjectOverview />} />
              <Route path="users" element={<ProjectPeople />} />
              <Route path="sprint" element={<ProjectSprints />} />
              <Route path="sprint/:sprintId/retrospective" element={<Retrospective />} />
              <Route path="backlog" element={<ProjectBacklogs />} />
              <Route path="backlog/:backlogId" element={<Backlog />} />
              <Route path="board" element={<ScrumBoard />} />
              <Route path="standup" element={<StandUpsPage />} />
              <Route path="standup/:standUpId" element={<StandUpBoardPage />} />
              <Route path="board/:sprintId" element={<SprintScrumBoardPage />} />
              <Route path="feedback" element={<ProjectFeedbacks />} />
              <Route path="statistics" element={<ProjectStatistics />} />
              <Route path="report" element={<ProjectReportPage />} />
              <Route path="settings" element={<ProjectSettings />} />
            </Route>
            <Route path="courses" element={<Courses />}>
              <Route path="" element={<Navigate to="current" />} />
              <Route path="current" element={<CurrentCourses />} />
              <Route path="past" element={<PastCourses />} />
              <Route path="future" element={<FutureCourses />} />
            </Route>
            <Route path="course/:courseId" element={<Course />}>
              <Route path="" element={<Navigate to="overview" />} />
              <Route path="overview" element={<CourseOverview />} />
              <Route path="users" element={<CoursePeople />} />
              <Route
                path="milestones"
                element={
                  <CourseManagerProtected>
                    <CourseMilestones />
                  </CourseManagerProtected>
                }
              />
              <Route
                path="statistics"
                element={
                  <CourseManagerProtected>
                    <CourseStatistics />
                  </CourseManagerProtected>
                }
              />
              <Route
                path="settings"
                element={
                  <CourseManagerProtected>
                    <CourseSettings />
                  </CourseManagerProtected>
                }
              />
            </Route>
            <Route path="account" element={<Account />} />
            <Route
              path="admin"
              element={
                <AdminProtected>
                  <Admin />
                </AdminProtected>
              }
            />
          </Route>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/callback/*" element={<Callback />} />
          <Route path="/join" element={<Invite />} />
          <Route
            path="*"
            element={
              <main style={{ padding: '1rem' }}>
                <p>404</p>
              </main>
            }
          />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
