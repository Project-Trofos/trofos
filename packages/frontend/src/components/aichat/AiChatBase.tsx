import React, { useRef, useState } from 'react';
import {
  Drawer,
  Space,
} from 'antd';
import { FundProjectionScreenOutlined, ReadOutlined, UserOutlined } from '@ant-design/icons';
import {
  Bubble,
  Prompts,
  Sender,
  Welcome,
  useXAgent,
  useXChat,
} from '@ant-design/x';
import ReactMarkdown from 'react-markdown'
import { useLazyAnswerUserGuideQueryQuery } from '../../api/ai';

type AiChatBaseProps = {
  open: boolean;
  onClose: () => void;
};

type BubbleListProps = React.ComponentProps<typeof Bubble.List>;
type RolesType = NonNullable<BubbleListProps['roles']>;

type PromptsProps = React.ComponentProps<typeof Prompts>;
type placeholderPromptsItemsType = NonNullable<PromptsProps['items']>;
type onPromptsItemClickType = NonNullable<PromptsProps['onItemClick']>;

const renderTitle = (icon: React.ReactElement, title: string) => (
  <Space align="start">
    {icon}
    <span>{title}</span>
  </Space>
);

const getLinksMarkDown = (links: string[]) => {
  if (!links || links.length === 0) {
    return '';
  }
  return links.map((link, index) => `${index + 1}. [${link}](${link})`).join('\n\n');
};

export default function AiChatBase({ open, onClose }: AiChatBaseProps): JSX.Element {
  const [senderValue, setSenderValue] = useState('');
  const [triggerSend, { data, error, isFetching }] = useLazyAnswerUserGuideQueryQuery();
  const abortRef = useRef<(() => void) | null>(null);

  const [agent] = useXAgent({
    request: async ({ message }, { onSuccess, onError, onUpdate }) => {
      if (!message) {
        onError(new Error('Message cannot be empty'));
        return;
      }
      setMessages((prevMessages) => [
        ...prevMessages,
        { id: 'loading', role: 'ai', message: '...', status: 'loading' },
      ]);
      try {
        const { unwrap, abort } = triggerSend(message);
        abortRef.current = abort;
        const data = await unwrap();
        setMessages((prevMessages) =>
          prevMessages.filter((msg) => msg.id !== 'loading')
        );
        const references = getLinksMarkDown(data?.links);
        onSuccess(data?.answer + (references !== '' ? `\n\nRelated links:\n${references}` : ''));
      } catch (error) {
        setMessages((prevMessages) =>
          prevMessages.filter((msg) => msg.id !== 'loading')
        );
        const err = error as Error;
        if (err.name === 'AbortError') {
          onError(new Error('Request was cancelled.'));
        } else {
          onError(new Error(err.message));
        }
      } 
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

  const placeholderPromptsItems: placeholderPromptsItemsType = [
    {
      key: '1',
      label: renderTitle(<ReadOutlined style={{ color: '#1890FF' }} />, 'Getting started'),
      description: 'Learn the basics of TROFOS?',
      children: [
        {
          key: '1-1',
          icon: <FundProjectionScreenOutlined />,
          description: `What is a project?`,
        },
        {
          key: '1-2',
          icon: <UserOutlined />,
          description: `How do I invite a user to a project?`,
        }
      ],
    },
  ];

  const onPromptsItemClick: onPromptsItemClickType = (info) => {
    onRequest(info.data.description as string);
  };

  const LinkRenderer = (props: any) => {
    return <a href={props.href} target="_blank">{props.children}</a>
  }

  const placeholderNode = (
    <Space direction="vertical" size={16}>
      <Welcome
        variant="borderless"
        title="Hello, I'm TROFOS Copilot!"
        description="I'm here to help you with your questions on TROFOS. How can I help you today?"
      />
      <Prompts
        title="Example prompts"
        items={placeholderPromptsItems}
        styles={{
          list: {
            width: '100%',
          },
          item: {
            flex: 1,
          },
        }}
        onItemClick={onPromptsItemClick}
      />
    </Space>
  );

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
          onCancel={() => {
            if (abortRef.current) {
              abortRef.current();
              abortRef.current = null;
            }
          }}
          onKeyPress={() => {}}
          loading={agent.isRequesting()}
          readOnly={agent.isRequesting()}
        />
      }
    >
      <Bubble.List
        items={messages.length > 0 ? 
          messages.map(({ id, message, status }) => ({
            key: id,
            loading: status === 'loading',
            role: status === 'local' ? 'local' : 'ai',
            content: (
              <ReactMarkdown
                components={{
                  a: ({ href, children, ...props }) => (
                    <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
                      {children}
                    </a>
                  ),
                }}
              >
                {message}
              </ReactMarkdown>
            ),
          })) : [{ content: placeholderNode, variant: 'borderless' }]
        }
        roles={roles}
      />
    </Drawer>
  );
}
