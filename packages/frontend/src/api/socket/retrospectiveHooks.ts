import {
  useAddRetrospectiveMutation as rtkUseAddRetrospectiveMutation,
  useAddRetrospectiveVoteMutation as rtkUseAddRetrospectiveVoteMutation,
  useUpdateRetrospectiveVoteMutation as rtkUseUpdateRetrospectiveVoteMutation,
  useDeleteRetrospectiveVoteMutation as rtkUseDeleteRetrospectiveVoteMutation,
} from '../sprint';
import attachFunctionToRtkHookHOF from './helper';
import { UpdateType } from './socket';
import { emitUpdateEvent } from './useSocket';

const useAddRetrospectiveMutation = attachFunctionToRtkHookHOF(rtkUseAddRetrospectiveMutation, (mutArgs) => {
  emitUpdateEvent(`${UpdateType.RETRO}/${mutArgs.sprintId}`, mutArgs.type);
});

const useAddRetrospectiveVoteMutation = attachFunctionToRtkHookHOF(rtkUseAddRetrospectiveVoteMutation, (mutArgs) => {
  emitUpdateEvent(`${UpdateType.RETRO}/${mutArgs.sprintId}`, mutArgs.retroType);
});

const useUpdateRetrospectiveVoteMutation = attachFunctionToRtkHookHOF(
  rtkUseUpdateRetrospectiveVoteMutation,
  (mutArgs) => {
    emitUpdateEvent(`${UpdateType.RETRO}/${mutArgs.sprintId}`, mutArgs.retroType);
  },
);

const useDeleteRetrospectiveVoteMutation = attachFunctionToRtkHookHOF(
  rtkUseDeleteRetrospectiveVoteMutation,
  (mutArgs) => {
    emitUpdateEvent(`${UpdateType.RETRO}/${mutArgs.sprintId}`, mutArgs.retroType);
  },
);

export {
  useAddRetrospectiveMutation,
  useAddRetrospectiveVoteMutation,
  useUpdateRetrospectiveVoteMutation,
  useDeleteRetrospectiveVoteMutation,
};
