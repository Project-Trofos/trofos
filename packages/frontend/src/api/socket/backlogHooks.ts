import {
  useAddBacklogMutation as rtkUseAddBacklogMutation,
  useUpdateBacklogMutation as rtkUseUpdateBacklogMutation,
  useDeleteBacklogMutation as rtkUseDeleteBacklogMutation,
} from '../backlog';
import attachFunctionToRtkHookHOF from './helper';
import { UpdateType } from './socket';
import { emitUpdateEvent } from './useSocket';

// Add backlog mutation hook, also emit update event to backend via socket io
const useAddBacklogMutation = attachFunctionToRtkHookHOF(rtkUseAddBacklogMutation, (mutArgs) => {
  emitUpdateEvent(`${UpdateType.BACKLOG}/${mutArgs.projectId}`);
});

// Update backlog mutation hook, also emit update event to backend via socket io
const useUpdateBacklogMutation = attachFunctionToRtkHookHOF(rtkUseUpdateBacklogMutation, (mutArgs) => {
  emitUpdateEvent(`${UpdateType.BACKLOG}/${mutArgs.projectId}`);
});

// Remove backlog mutation hook, also emit update event to backend via socket io
const useDeleteBacklogMutation = attachFunctionToRtkHookHOF(rtkUseDeleteBacklogMutation, (mutArgs) => {
  emitUpdateEvent(`${UpdateType.BACKLOG}/${mutArgs.projectId}`);
});

export { useAddBacklogMutation, useUpdateBacklogMutation, useDeleteBacklogMutation };
