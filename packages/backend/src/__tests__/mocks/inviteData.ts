import { Invite, User, Project } from '@prisma/client';

const validExpiry = new Date(Date.now());
validExpiry.setDate(validExpiry.getDate() + 7);

export const validInviteData: Invite = {
  project_id: 1,
  email: 'validemail@test.com',
  unique_token: '2c883054-0d4c-43b7-9c91-a0acf6096c56',
  expiry_date: validExpiry,
};

export const validInviteProject: Project = {
  id: 1,
  pname: 'c1',
  created_at: new Date(Date.now()),
  course_id: 5,
  pkey: null,
  description: 'd1',
  public: false,
  backlog_counter: 0,
  telegramChannelLink: '',
  is_archive: null,
  owner_id: null,
};

export const updatedInviteData: Invite = {
  project_id: 1,
  email: 'validemail@test.com',
  unique_token: '011fc2df-7e13-483b-8cf3-3fa38aa27140',
  expiry_date: validExpiry,
};

export const validUser: User = {
  user_id: 1,
  user_display_name: 'validemail@test.com',
  user_email: 'validemail@test.com',
  user_password_hash: null,
  has_completed_tour: false,
};

const expired = new Date(Date.now());
expired.setDate(expired.getDate() - 10);

export const expiredInviteData: Invite = {
  project_id: 900,
  email: 'mockemail@test.com',
  unique_token: 'eb95d491-7918-445c-b82c-7305d392fac4',
  expiry_date: expired,
};

export const mockInviteInfoFromProjId: Pick<Invite, 'project_id' | 'email' | 'expiry_date'>[] = [
  {
    project_id: 900,
    email: 'email1@test.com',
    expiry_date: validExpiry,
  },
  {
    project_id: 900,
    email: 'email2@test.com',
    expiry_date: validExpiry,
  },
  {
    project_id: 900,
    email: 'email3@test.com',
    expiry_date: validExpiry,
  },
];
