import React from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import MainLayout from '../templates/MainLayout';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Project from '../pages/Project';
import Projects from '../pages/Projects';
import Courses from '../pages/Courses';
import Course from '../pages/Course';
import Backlog from '../pages/Backlog';
import Account from '../pages/Account';
import Admin from '../pages/Admin';

import ProjectOverview from '../pages/ProjectOverview';
import ProjectBacklogs from '../pages/ProjectBacklogs';
import ScrumBoard, { SprintScrumBoardPage } from '../pages/ScrumBoardPage';

import './App.css';
import ProjectSettings from '../pages/ProjectSettings';
import CourseOverview from '../pages/CourseOverview';
import CourseSettings from '../pages/CourseSettings';
import ProjectSprints from '../pages/ProjectSprints';
import CoursePeople from '../pages/CoursePeople';
import ProjectPeople from '../pages/ProjectPeople';
import Retrospective from '../pages/Retrospective';
import ProjectFeedbacks from '../pages/ProjectFeedbacks';
import CourseStatistics from '../pages/CourseStatistics';
import { AdminProtected, CourseManagerProtected } from '../helpers/ProtectedRoute';
import CourseMilestones from '../pages/CourseMilestones';
import Callback from '../pages/Callback';
import ProjectStatistics from '../pages/ProjectStatistics';
import ThemeProvider from '../components/theming/ThemeProvider';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route path="" element={<Home />} />
            <Route path="projects" element={<Projects />} />
            <Route path="project/:projectId" element={<Project />}>
              <Route path="" element={<Navigate to="overview" />} />
              <Route path="overview" element={<ProjectOverview />} />
              <Route path="users" element={<ProjectPeople />} />
              <Route path="sprint" element={<ProjectSprints />} />
              <Route path="sprint/:sprintId/retrospective" element={<Retrospective />} />
              <Route path="backlog" element={<ProjectBacklogs />} />
              <Route path="backlog/:backlogId" element={<Backlog />} />
              <Route path="board" element={<ScrumBoard />} />
              <Route path="board/:sprintId" element={<SprintScrumBoardPage />} />
              <Route path="feedback" element={<ProjectFeedbacks />} />
              <Route path="statistics" element={<ProjectStatistics />} />
              <Route path="settings" element={<ProjectSettings />} />
            </Route>
            <Route path="courses" element={<Courses />} />
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
          <Route path="/callback/*" element={<Callback />} />
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
