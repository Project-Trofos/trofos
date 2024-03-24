import { Draggable } from 'react-beautiful-dnd';

type DraggableWrapperProps = { id: number; index: number };

export const draggableWrapper = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
): React.FC<P & DraggableWrapperProps> => {
  return (props: P & DraggableWrapperProps) => (
    <Draggable draggableId={props.id.toString()} index={props.index}>
      {(provided) => (
        <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
          <WrappedComponent {...props} />
        </div>
      )}
    </Draggable>
  );
};
