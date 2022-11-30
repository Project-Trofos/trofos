// Workaround for issue with React 18 strict mode (https://github.com/atlassian/react-beautiful-dnd/issues/2350)
// Code for fix obtained from https://github.com/atlassian/react-beautiful-dnd/issues/2399#issuecomment-1175638194

import React, { useEffect, useState } from 'react';
import { Droppable, DroppableProps } from 'react-beautiful-dnd';

export default function StrictModeDroppable({ children, ...props }: DroppableProps) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const animation = requestAnimationFrame(() => setEnabled(true));

    return () => {
      cancelAnimationFrame(animation);
      setEnabled(false);
    };
  }, []);

  if (!enabled) {
    return null;
  }

  return <Droppable {...props}>{children}</Droppable>;
}
