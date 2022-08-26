/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Project } from '../api/project';
import type { RootState } from '../app/store';

type ProjectsState = {
  projects: Project[];
};

const initialState: ProjectsState = {
  projects: [],
};

export const projectsSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    addProject: (state, action: PayloadAction<Project>) => {
      state.projects = [...state.projects, action.payload];
    },
    removeProjectById: (state, action: PayloadAction<string>) => {
      state.projects = state.projects.filter((project) => project.id !== action.payload);
    },
  },
});

export const { addProject, removeProjectById } = projectsSlice.actions;

export const selectProjects = (state: RootState) => state.projects;

export default projectsSlice.reducer;
