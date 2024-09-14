export type ApiKeyAuth = {
  isValidUser: false;
} | {
  isValidUser: true;
  user_id: number;
  role_id: number;
  user_is_admin: boolean;
};
