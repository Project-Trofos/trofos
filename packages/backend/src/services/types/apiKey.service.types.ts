export type ApiKeyAuth = {
  isValidUser: false;
} | ApiKeyAuthIsValid;

export type ApiKeyAuthIsValid = {
  isValidUser: true;
  user_id: number;
  role_id: number;
  user_is_admin: boolean;
  user_email: string;
};
