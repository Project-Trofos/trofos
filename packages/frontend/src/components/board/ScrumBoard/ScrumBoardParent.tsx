import React from 'react';
import { Tabs } from 'antd';
import type { TabsProps } from 'antd';
import { Sprint } from '../../../api/sprint';
import ScrumBoard from './ScrumBoard';
import ScrumBoardNotesTab from './ScrumBoardNotesTab';

type ScrumBoardParentProps = { projectId: number; sprint?: Sprint };

export default function ScrumBoardParent(props: ScrumBoardParentProps): JSX.Element {
  const { projectId, sprint } = props;

  const items: TabsProps['items'] = [
    {
      key: 'scrumboard',
      label: 'Scrum Board',
      children: <ScrumBoard projectId={projectId} sprint={sprint} />,
    }, {
      key: 'notes',
      label: 'Notes',
      children: <ScrumBoardNotesTab />
    }
  ];

  return (
    <Tabs defaultActiveKey='scrumboard' items={items} />
  );
}