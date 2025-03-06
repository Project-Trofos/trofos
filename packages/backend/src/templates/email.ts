export function commentSubject(projectName: string, backlog: string) {
  return `Trofos - New comment on ${projectName}: ${backlog}`;
}

export function commentBody(username: string, comment: string, projectId: number, backlogId: number) {
  return `
    New comment added by ${username}: ${comment}
    
    Backlog link: ${process.env.FRONTEND_BASE_URL}/project/${projectId}/backlog/${backlogId}
  `;
}

export const inviteHTMLSubject = (pName: string) => `Trofos - Invitation to join project ${pName}`;

export const inviteHTMLTemplate = (invitationToken: string) => `
  <html>
  <body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
    <div style="
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      border-radius: 8px;
      background-color: #f5f5f5;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      color: #333;
    ">
      <div style="
        background-color: #c5e3d7;
        padding: 20px;
        text-align: center;
        border-radius: 8px;
      ">
        <h1 style="margin: 0; font-size: 24px;">You're Invited to TROFOS!</h1>
      </div>

      <div style="padding: 20px; text-align: left;">
        <p style="font-size: 16px; line-height: 1.6;">
          Hello, 
        </p>

        <p style="font-size: 16px; line-height: 1.6;">
          You have been invited to collaborate on a project using TROFOS, a platform designed to help students gain hands-on experience with agile project management. 
        </p>
        
        <p style="font-size: 16px; line-height: 1.6;">
          <strong>What is TROFOS?</strong>  
          TROFOS is an academic alternative to Jira, allowing students to experience agile methodologies in a structured learning environment. 
          It helps teams plan, track, and manage their projects while aligning with industry standards.
        </p>

        <p style="font-size: 16px; line-height: 1.6;">
          Join now to start collaborating with your team, managing tasks efficiently, and improving your project workflow.
        </p>

        <a 
          href="${process.env.FRONTEND_BASE_URL}/join?token=${invitationToken}"
          style="
            display: inline-block;
            background-color: #32a2ac;
            color: #ffffff;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 5px;
            font-size: 18px;
            font-weight: bold;
          "
        >Accept Invitation</a>

        <p style="font-size: 14px; line-height: 1.6; margin-top: 20px;">
          If you did not expect this invitation, you can safely ignore this email.
        </p>

        <hr style="border: 0; height: 1px; background: #ddd; margin: 20px 0;">
        <p style="font-size: 12px; color: #888; text-align: center;">
          You received this email because you are part of the TROFOS platform.  
          If you no longer wish to receive such emails,  
          <a href="${process.env.FRONTEND_BASE_URL}/unsubscribe" style="color: #32a2ac;">unsubscribe here</a>.
        </p>
      </div>
    </div>
  </body>
  </html>`;

export const inviteTextTemplate = (invitationToken: string) => `
    You're Invited to TROFOS!

    Hello,

    You have been invited to collaborate on a project using TROFOS, a platform designed to help students gain hands-on experience with agile project management.

    What is TROFOS?
    TROFOS is an academic alternative to Jira, allowing students to experience agile methodologies in a structured learning environment. 
    It helps teams plan, track, and manage their projects while aligning with industry standards.

    Join now to start collaborating with your team, managing tasks efficiently, and improving your project workflow.

    Click the link below to accept the invitation and join the project:
    ${process.env.FRONTEND_BASE_URL}/join?token=${invitationToken}

    If you did not expect this invitation, you can safely ignore this email.

    ------------------
    You received this email because you are part of the TROFOS platform.  
    If you no longer wish to receive such emails, unsubscribe here:  
    ${process.env.FRONTEND_BASE_URL}/unsubscribe
  `;
