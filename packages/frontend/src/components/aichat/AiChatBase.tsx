import React, { useState } from 'react';
import {
  Drawer,
} from 'antd';
import { UserOutlined } from '@ant-design/icons';
import {
  Bubble,
  Sender,
  useXAgent,
  useXChat,
} from '@ant-design/x';
import { useLazyAnswerUserGuideQueryQuery } from '../../api/ai';

type AiChatBaseProps = {
  open: boolean;
  onClose: () => void;
};

type BubbleListProps = React.ComponentProps<typeof Bubble.List>;
type RolesType = NonNullable<BubbleListProps['roles']>;

export default function AiChatBase({ open, onClose }: AiChatBaseProps): JSX.Element {
  const [senderValue, setSenderValue] = useState('');
  const [triggerSend, { data, error, isLoading }] = useLazyAnswerUserGuideQueryQuery();

  const [agent] = useXAgent({
    request: async ({ message }, { onSuccess, onError }) => {
      if (!message) {
        onError(new Error('Message cannot be empty'));
        return;
      }
      const { data } = await triggerSend(message);
      onSuccess(data?.answer || '');
    },
  });

  const { onRequest, messages, setMessages } = useXChat({
    agent,
  });

  const roles: RolesType = {
    ai: {
      placement: 'start',
      avatar: { icon: <UserOutlined />, style: { background: '#fde3cf' } },
      typing: { step: 5, interval: 20 },
      style: {
        maxWidth: 600,
      },
    },
    local: {
      placement: 'end',
      avatar: { icon: <UserOutlined />, style: { background: '#87d068' } },
    },
  };

  return (
    <Drawer
      title="TROFOS Copilot"
      open={open}
      onClose={onClose}
      mask={false}
      footer={
        <Sender 
          value={senderValue}
          onChange={(v)=>setSenderValue(v)}
          placeholder={'Ask TROFOS copilot...'}
          onSubmit={(v)=>{
            onRequest(v);
            setSenderValue('');
          }}
          onCancel={()=>{}}
          onKeyPress={() => {}}
        />
      }
    >
      <Bubble.List
        items={messages.map(({ id, message, status }) => ({
          key: id,
          loading: status === 'loading',
          role: status === 'local' ? 'local' : 'ai',
          content: message,
        }))}
        roles={roles}
      />
    </Drawer>
  );
}
