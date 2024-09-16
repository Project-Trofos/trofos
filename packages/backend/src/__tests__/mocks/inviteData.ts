import { Invite, User } from '@prisma/client';

export const inviteData = {
  project_id: 900,
  email: 'mockemail@test.com',
  unique_token: '',
};

export const validInviteData: Invite = {
  project_id: 1,
  email: 'validemail@test.com',
  unique_token: '2c883054-0d4c-43b7-9c91-a0acf6096c56',
  expiry_date: new Date(Date.now()),
};

export const updatedInviteData: Invite = {
  project_id: 1,
  email: 'validemail@test.com',
  unique_token: '011fc2df-7e13-483b-8cf3-3fa38aa27140',
  expiry_date: new Date(Date.now()),
};

export const validUser: User = {
  user_id: 1,
  user_display_name: 'validemail@test.com',
  user_email: 'validemail@test.com',
  user_password_hash: null,
};

export const expiredInviteData: Invite = {
  project_id: 900,
  email: 'mockemail@test.com',
  unique_token: 'eb95d491-7918-445c-b82c-7305d392fac4',
  expiry_date: new Date(Date.now() - 100),
};

export const mockInviteInfoFromProjId: Pick<Invite, 'project_id' | 'email' | 'expiry_date'>[] = [
  {
    project_id: 900,
    email: 'email1@test.com',
    expiry_date: new Date(Date.now()),
  },
  {
    project_id: 900,
    email: 'email2@test.com',
    expiry_date: new Date(Date.now()),
  },
  {
    project_id: 900,
    email: 'email3@test.com',
    expiry_date: new Date(Date.now()),
  },
];
