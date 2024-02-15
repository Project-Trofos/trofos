import { emit } from 'process';
import {
  useAddStandUpNoteMutation as rtkUseAddStandUpNoteMutation,
  useUpdateStandUpNoteMutation as rtkUseUpdateStandUpNoteMutation,
  useDeleteStandUpNoteMutation as rtkUseDeleteStandUpNoteMutation,
  useAddStandUpMutation as rtkUseAddStandUpMutation,
  useUpdateStandUpMutation as rtkUseUpdateStandUpMutation,
  useDeleteStandUpMutation as rtkUseDeleteStandUpMutation,
} from '../standup';
import attachFunctionToRtkHookHOF from './helper';
import { UpdateType } from './socket';
import { emitUpdateEvent } from './useSocket';

export const useAddStandUpNoteMutation = attachFunctionToRtkHookHOF(rtkUseAddStandUpNoteMutation, (mutArgs) => {
  emitUpdateEvent(`${UpdateType.STAND_UP_NOTES}/${mutArgs.standUpId}`);
});

export const useUpdateStandUpNoteMutation = attachFunctionToRtkHookHOF(rtkUseUpdateStandUpNoteMutation, (mutArgs) => {
  emitUpdateEvent(`${UpdateType.STAND_UP_NOTES}/${mutArgs.standUpId}`);
});

export const useDeleteStandUpNoteMutation = attachFunctionToRtkHookHOF(rtkUseDeleteStandUpNoteMutation, (mutArgs) => {
  emitUpdateEvent(`${UpdateType.STAND_UP_NOTES}/${mutArgs.standUpId}`);
});

export const useAddStandUpMutation = attachFunctionToRtkHookHOF(rtkUseAddStandUpMutation, (mutArgs) => {
  emitUpdateEvent(`${UpdateType.STAND_UP}/${mutArgs.projectId}`);
});

export const useUpdateStandUpMutation = attachFunctionToRtkHookHOF(rtkUseUpdateStandUpMutation, (mutArgs) => {
  emitUpdateEvent(`${UpdateType.STAND_UP}/${mutArgs.projectId}`);
});

export const useDeleteStandUpMutation = attachFunctionToRtkHookHOF(rtkUseDeleteStandUpMutation, (mutArgs) => {
  emitUpdateEvent(`${UpdateType.STAND_UP}/${mutArgs.projectId}`);
});
