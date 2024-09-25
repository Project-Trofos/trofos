import { Draggable } from 'react-beautiful-dnd';
type DraggableWrapperProps = { id: number; index: number };

export const draggableWrapper = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
): React.FC<P & DraggableWrapperProps> => {
  return (props: P & DraggableWrapperProps) => (
    <Draggable draggableId={props.id.toString()} index={props.index}>
      {(provided) => (
        <div 
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          // Draggables are not aligned in antd carousel
          // Solution: https://stackoverflow.com/questions/54982182/react-beautiful-dnd-drag-out-of-position-problem
          style={{ ...provided.draggableProps.style,
            left: "auto !important",
            top: "auto !important",
          }}
        >
          <WrappedComponent {...props} />
        </div>
      )}
    </Draggable>
  );
};
