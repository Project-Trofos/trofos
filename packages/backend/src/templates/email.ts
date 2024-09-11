export function commentSubject(projectName: string, backlog: string) {
  return `Trofos - New comment on ${projectName}: ${backlog}`;
}

export function commentBody(username: string, comment: string, projectId: number, backlogId: number) {
  return `
    New comment added by ${username}: ${comment}
    
    Backlog link: ${process.env.FRONTEND_BASE_URL}/project/${projectId}/backlog/${backlogId}
  `;
}

export function projectInviteSubject(projectName: string) {
  return `Trofos - Invitation to join project ${projectName}`;
}

export function projectInviteBody(
  invitationToken: string,
  senderName: string,
  senderEmail: string,
  isRegister: boolean,
) {
  const BASE_URL =
    process.env.NODE_ENV === 'test' ? 'http://localhost:3000' : 'https://trofos-production.comp.nus.edu.sg';
  const invitationLink = `${BASE_URL}/join?token=${invitationToken}` + (isRegister ? '&register=true' : '');

  return `
    ${senderName} (${senderEmail}) has invited you to join a project.
  
    Click to join: ${invitationLink}
  `;
}
