import { Retrospective } from "../api/types";

export interface BacklogFormFields extends FormData {
  projectId: number;
  retrospective?: Retrospective;
}

export type BacklogSelectTypes = {
  id: string | number;
  name: string;
  labelComponent?: JSX.Element;
};

export type BacklogUserSelectTypes = {
  [user: string]: { user_id: number; user_email: string; user_display_name: string };
};
