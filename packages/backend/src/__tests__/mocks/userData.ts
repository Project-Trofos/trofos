import { User } from '@prisma/client';

export const userData: User[] = [
  {
    user_email: 'testUser@test.com',
    user_id: 1,
    user_password_hash: 'hash',
    user_display_name: 'Test User',
  },
];
