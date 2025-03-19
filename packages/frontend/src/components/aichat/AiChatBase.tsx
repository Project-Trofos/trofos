import React, { useRef, useState } from 'react';
import {
  Drawer,
  Dropdown,
  Flex,
  Space,
  Switch,
  Tag,
  Typography,
  theme,
} from 'antd';
import { FundProjectionScreenOutlined, ReadOutlined, RobotOutlined, SettingOutlined, UserOutlined } from '@ant-design/icons';
import {
  Bubble,
  Prompts,
  Sender,
  Welcome,
  useXAgent,
  useXChat,
} from '@ant-design/x';
import ReactMarkdown from 'react-markdown'
import { useAnswerUserGuideQueryMutation  } from '../../api/ai';

const SEPERATOR = '|||';

const { useToken } = theme;

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

const MemoryIndicator = ({ isEnableMemory }:
  { isEnableMemory: boolean }
) => (
  <div
    style={{
      position: 'absolute',
      bottom: '10%',
      left: '20%',
      transform: 'translateX(-50%)',
      zIndex: 10,
      pointerEvents: 'none',
    }}
  >
    <Tag color={isEnableMemory ? 'green' : 'red'} style={{ opacity: 0.8 }}>
      {isEnableMemory ? 'Memory Enabled' : 'Memory Disabled'}
    </Tag>
  </div>
);

export default function AiChatBase({ open, onClose }: AiChatBaseProps): JSX.Element {
  const [senderValue, setSenderValue] = useState('');
  const [triggerSend, { data, error }] = useAnswerUserGuideQueryMutation ();
  const abortRef = useRef<(() => void) | null>(null);
  const { token } = useToken();
  const [isEnableMemory, setIsEnableMemory] = useState(false);

  const chatSettingsMenuContentStyle: React.CSSProperties = {
    padding: 10,
    background: token.colorBgContainer,
    borderRadius: 8,
    boxShadow: token.boxShadowSecondary,
  };

  const [agent] = useXAgent({
    request: async ({ message }, { onSuccess, onError, onUpdate }) => {
      if (!message) {
        onError(new Error('Message cannot be empty'));
        return;
      }
      // workaround to extract isEnableMemory from message from limitation of useXAgent
      const separatorIndex = message.indexOf(SEPERATOR);

      let extractedIsEnableMemory = false;
      let actualMessage = message;
      if (separatorIndex !== -1) {
        const memoryString = message.substring(0, separatorIndex);
        actualMessage = message.substring(separatorIndex + SEPERATOR.length);
        extractedIsEnableMemory = memoryString === 'true';
      }

      setMessages((prevMessages) => {
        console.log(prevMessages)
        if (prevMessages.length === 0) {
          // If no previous messages, just add the new one
          return [
            { id: 'loading', role: 'ai', message: actualMessage, status: 'loading' },
          ];
        }
      
        // Copy all previous messages except the last one, then update the last message
        return [
          ...prevMessages.slice(0, -1),
          {
            ...prevMessages[prevMessages.length - 1], // Copy last message
            message: actualMessage, // Update only message value
          },
          { id: 'loading', role: 'ai', message: actualMessage, status: 'loading' },
        ];
      });
      try {
        const { unwrap, abort } = triggerSend({ query: actualMessage, isEnableMemory: extractedIsEnableMemory });
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
    }
  });

  const { onRequest, messages, setMessages } = useXChat({
    agent,
  });

  const roles: RolesType = {
    ai: {
      placement: 'start',
      avatar: { icon: <RobotOutlined />, style: { background: '#87d068' } },
      typing: { step: 5, interval: 20 },
      style: {
        maxWidth: 600,
      },
    },
    local: {
      placement: 'end',
      avatar: { icon: <UserOutlined />, style: { background: '#0000FF' } },
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
      title={
        <Flex justify="space-between" align="center">
          <Typography.Title level={5} style={{ margin: 0 }}>
            ✨️TROFOS Copilot
          </Typography.Title>
          <Dropdown
            dropdownRender={(menu) => (
              <Space style={chatSettingsMenuContentStyle}>
                <Space direction='horizontal'>
                  <Typography.Text>Enable memory</Typography.Text>
                  <Switch
                    checked={isEnableMemory}
                    onChange={(checked) => setIsEnableMemory(checked)}
                  />
                </Space>
              </Space> 
            )}
            trigger={['click']}
          >
            <SettingOutlined />
          </Dropdown>
        </Flex>
      }
      open={open}
      onClose={onClose}
      mask={false}
      footer={
        <Sender 
          value={senderValue}
          onChange={(v)=>setSenderValue(v)}
          placeholder={'Ask TROFOS copilot...'}
          onSubmit={(v)=>{
            // Concat with delimiter as workaround of limitation of x-chat, can't use most updated
            // var as useXAgent useMemo and cannot update anymore
            const messageWithMemory = `${isEnableMemory}${SEPERATOR}${v}`;
            onRequest(messageWithMemory);
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
      <MemoryIndicator isEnableMemory={isEnableMemory} />
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
