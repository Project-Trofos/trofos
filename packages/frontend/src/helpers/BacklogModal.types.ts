export interface BacklogFormFields extends FormData {
  projectId: number;
}

export type BacklogSelectTypes = {
  id: string | number;
  name: string;
};

export type BacklogUserSelectTypes = {
  [user: string]: { user_id: number; user_email: string; user_display_name: string };
};
