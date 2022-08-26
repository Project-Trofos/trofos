import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Project from '../pages/Project';
import Projects from '../pages/Projects';

import ProjectOverview from '../pages/ProjectOverview';
import ProjectBacklog from '../pages/ProjectBacklog';
import ProjectKanban from '../pages/ProjectKanban';

import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route path="" element={<Home />} />
          <Route path="projects" element={<Projects />} />
          <Route path="project/:projectId" element={<Project />}>
            <Route path="" element={<ProjectOverview />} />
            <Route path="backlog" element={<ProjectBacklog />} />
            <Route path="kanban" element={<ProjectKanban />} />
          </Route>
        </Route>
        <Route path="/login" element={<Login />} />
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
  );
}

export default App;
