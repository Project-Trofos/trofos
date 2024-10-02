import {
  useAddBacklogMutation as rtkUseAddBacklogMutation,
  useUpdateBacklogMutation as rtkUseUpdateBacklogMutation,
  useDeleteBacklogMutation as rtkUseDeleteBacklogMutation,
  useAddEpicMutation as rtkUseAddEpicMutation,
  useAddBacklogToEpicMutation as rtkUseAddBacklogToEpicMutation,
  useRemoveBacklogFromEpicMutation as rtkUseRemoveBacklogFromEpicMutation,
  useDeleteEpicMutation as rtkUseDeleteEpicMutation,
} from '../backlog';
import attachFunctionToRtkHookHOF from './helper';
import { UpdateType } from './socket';
import { emitUpdateEvent } from './useSocket';

// Add backlog mutation hook, also emit update event to backend via socket io
const useAddBacklogMutation = attachFunctionToRtkHookHOF(rtkUseAddBacklogMutation, (mutArgs) => {
  emitUpdateEvent(`${UpdateType.BACKLOG}/${mutArgs.projectId}`);
}, (mutArgs) => {
  emitUpdateEvent(`${UpdateType.RETRO}/${mutArgs.retrospective?.sprint_id}`, mutArgs.retrospective?.type);
});

// Update backlog mutation hook, also emit update event to backend via socket io
const useUpdateBacklogMutation = attachFunctionToRtkHookHOF(rtkUseUpdateBacklogMutation, (mutArgs) => {
  emitUpdateEvent(`${UpdateType.BACKLOG}/${mutArgs.projectId}`);
});

// Remove backlog mutation hook, also emit update event to backend via socket io
const useDeleteBacklogMutation = attachFunctionToRtkHookHOF(rtkUseDeleteBacklogMutation, (mutArgs) => {
  emitUpdateEvent(`${UpdateType.BACKLOG}/${mutArgs.projectId}`);
});

// Add epic mutation hook, also emit update event to backend via socket io
const useAddEpicMutation = attachFunctionToRtkHookHOF(rtkUseAddEpicMutation, (mutArgs) => {
  emitUpdateEvent(`${UpdateType.EPIC}/${mutArgs.epic.projectId}`);
});

const useAddBacklogToEpicMutation = attachFunctionToRtkHookHOF(rtkUseAddBacklogToEpicMutation, (mutArgs) => {
  emitUpdateEvent(`${UpdateType.BACKLOG}/${mutArgs.projectId}`);
});

const useRemoveBacklogFromEpicMutation = attachFunctionToRtkHookHOF(rtkUseRemoveBacklogFromEpicMutation, (mutArgs) => {
  emitUpdateEvent(`${UpdateType.BACKLOG}/${mutArgs.projectId}`);
});

// Delete epic mutation hook, also emit update event to backend via socket io
const useDeleteEpicMutation = attachFunctionToRtkHookHOF(rtkUseDeleteEpicMutation, (mutArgs) => {
  emitUpdateEvent(`${UpdateType.EPIC}/${mutArgs.projectId}`);
  emitUpdateEvent(`${UpdateType.BACKLOG}/${mutArgs.projectId}`);
});

export {
  useAddBacklogMutation,
  useUpdateBacklogMutation,
  useDeleteBacklogMutation,
  useAddEpicMutation,
  useAddBacklogToEpicMutation,
  useRemoveBacklogFromEpicMutation,
  useDeleteEpicMutation,
};
