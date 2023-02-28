export function commentSubject(projectName: string, backlog: string) {
  return `Trofos - New comment on ${projectName}: ${backlog}`;
}

export function commentBody(username: string, comment: string, projectId: number, backlogId: number) {
  return `
    New comment added by ${username}: ${comment}
    
    Backlog link: ${process.env.FRONTEND_BASE_URL}/project/${projectId}/backlog/${backlogId}
  `;
}
