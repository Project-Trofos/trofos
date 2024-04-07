export interface EpicFormFields extends FormData {
  projectId: number;
  name?: string; // not optional, made optional to pass type checks for payload in EpicCreationModal
  description?: string;
}
