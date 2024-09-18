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

export function projectInviteBody(invitationToken: string, senderName: string, senderEmail: string) {
  const invitationLink = `${process.env.FRONTEND_BASE_URL}/join?token=${invitationToken}`;

  return `
    ${senderName} (${senderEmail}) has invited you to join a project.
  
    Click to join: ${invitationLink}
  `;
}
