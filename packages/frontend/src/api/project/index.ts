export type Project = {
  id: string;
  name: string;
  key?: string;
  description?: string;
};

let projects: Project[] = new Array(2)
  .fill(null)
  .map((item, index) => ({ id: String(index), name: `Project ${index}`, description: `Project ${index} description` }));

export function getProjects(): Project[] {
  return projects;
}

export function createProject(project: Project): boolean {
  projects.push(project);
  return true;
}

export function deleteProject(project: Project): boolean {
  projects = projects.filter((p) => p.id !== project.id);
  return true;
}
