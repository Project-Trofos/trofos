export function commentSubject(projectName: string, backlog: string) {
  return `Trofos - New comment on ${projectName}: ${backlog}`;
}

export function commentBody(username: string, comment: string, projectId: number, backlogId: number) {
  return `
    New comment added by ${username}: ${comment}
    
    Backlog link: ${process.env.FRONTEND_BASE_URL}/project/${projectId}/backlog/${backlogId}
  `;
}

export const inviteHTMLTemplate = `
  <div style="
    width: 100%;
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
    border-radius: 8px;
    background-color: #ffffff0;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    color: #333;
  ">
    <div style="
      background-color: #c5e3d7;
      padding: 20px;
      text-align: center;
      border-radius: 8px;
    ">
      <h1 style="
        margin: 0;
        font-size: 24px;
      ">Project Invitation</h1>
    </div>

    <div style="
      padding: 20px;
      text-align: left;
    ">
      <p style="
        font-size: 16px;
        line-height: 1.6;
      ">You have been invited to join a project.</p>

      <a 
        href="${process.env.FRONTEND_BASE_URL}/join?token={{invitationToken}}"
        style="
          display: inline-block;
          background-color: #32a2ac;
          color: #ffffff;
          padding: 10px 20px;
          text-decoration: none;
          border-radius: 5px;
          font-size: 18px;"
      >Join</a>
    </div>
  </div>`;
