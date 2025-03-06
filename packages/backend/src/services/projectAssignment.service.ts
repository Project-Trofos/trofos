import { ProjectAssignment, Project } from '@prisma/client';
import prisma from '../models/prismaClient';

// Ensures that sourceProject and targetProject belong to the same course
// Projects can only be assigned to other projects in the same course
async function create(sourceProjectId: number, targetProjectId: number): Promise<ProjectAssignment> {
  const [sourceProject, targetProject] = await prisma.$transaction([
    prisma.project.findUnique({
      where: { id: sourceProjectId },
    }),
    prisma.project.findUnique({
      where: { id: targetProjectId },
    }),
  ]);

  if (!sourceProject || !targetProject) {
    throw new Error('One or both projects do not exist.');
  }

  if (sourceProject.course_id !== targetProject.course_id) {
    throw new Error('Projects must belong to the same course.');
  }

  return await prisma.projectAssignment.create({
    data: {
      sourceProjectId,
      targetProjectId,
    },
  });
}

async function remove(sourceProjectId: number, id: number): Promise<ProjectAssignment> {
  const projectAssignment = await prisma.projectAssignment.findUnique({
    where: { id },
  });

  if (!projectAssignment) {
    throw new Error('Assigned project does not exist.');
  }

  // Check if the source project ID matches before deletion
  // This ensures that only the owner of the project can delete the assignment
  if (projectAssignment.sourceProjectId !== sourceProjectId) {
    throw new Error('Unauthorized: Project ID does not match.');
  }

  return await prisma.projectAssignment.delete({
    where: { id },
  });
}

async function getAssignedProjects(projectId: number): Promise<{ id: number; targetProject: Project }[]> {
  return await prisma.projectAssignment.findMany({
    where: {
      sourceProjectId: projectId,
    },
    select: {
      id: true,
      targetProject: true,
    },
  });
}

async function checkProjectAssigned(sourceProjectId: number, targetProjectId: number): Promise<void> {
  const projectAssignment = await prisma.projectAssignment.findUnique({
    where: {
      sourceProjectId_targetProjectId: {
        sourceProjectId,
        targetProjectId,
      },
    },
  });

  if (!projectAssignment) {
    throw new Error('Invalid project assignment. Action not permitted.');
  }
}

export default { create, remove, getAssignedProjects, checkProjectAssigned };
