import {
  useAddSprintMutation as rtkUseAddSprintMutation,
  useUpdateSprintMutation as rtkUseUpdateSprintMutation,
  useDeleteSprintMutation as rtkUseDeleteSprintMutation,
} from '../sprint';
import attachFunctionToRtkHookHOF from './helper';
import { UpdateType } from './socket';
import { emitUpdateEvent } from './useSocket';

const useAddSprintMutation = attachFunctionToRtkHookHOF(rtkUseAddSprintMutation, (mutArgs) => {
  emitUpdateEvent(`${UpdateType.BACKLOG}/${mutArgs.projectId}`);
});

const useUpdateSprintMutation = attachFunctionToRtkHookHOF(rtkUseUpdateSprintMutation, (mutArgs) => {
  emitUpdateEvent(`${UpdateType.BACKLOG}/${mutArgs.projectId}`);
});

const useDeleteSprintMutation = attachFunctionToRtkHookHOF(rtkUseDeleteSprintMutation, (mutArgs) => {
  emitUpdateEvent(`${UpdateType.BACKLOG}/${mutArgs.projectId}`);
});

export { useAddSprintMutation, useUpdateSprintMutation, useDeleteSprintMutation };
