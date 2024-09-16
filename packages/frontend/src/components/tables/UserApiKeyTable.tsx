import React, { useState } from 'react';
import { UserApiKey } from '../../api/types';
import { Button, Empty, Space, Table } from 'antd';
import { Subheading } from '../typography';
import { useGenerateUserApiKeyMutation, useGetUserApiKeyQuery } from '../../api/apiKey';
import GeneratedApiKeyModal from '../modals/GeneratedApiKeyModal';
import { formatDbTimestamp } from '../../helpers/dateFormatter';

export default function UserApiKeyTable(): JSX.Element {
  const [generateUserApiKey, { isLoading: isGeneratingApiKey }] = useGenerateUserApiKeyMutation();
  const { data: userApiKey, isLoading: isUserApiKeyLoading } = useGetUserApiKeyQuery();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);

  console.log(userApiKey);

  const handleGenerateUserApiKey = async () => {
    try {
      const newApiKey = await generateUserApiKey().unwrap();
      setApiKey(newApiKey.api_key);
      setIsModalOpen(true);
    } catch (error) {
      console.error(error);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setApiKey(null);
  };

  let locale = {
    emptyText: (
      <Empty description="No API Keys found">
        <Button onClick={handleGenerateUserApiKey} loading={isGeneratingApiKey}>
          Generate API Key
        </Button>
      </Empty>
    ),
  };

  return (
    <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
      <Space style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Subheading>{'My Keys'}</Subheading>
      </Space>
      <GeneratedApiKeyModal isModalOpen={isModalOpen} apiKey={apiKey} handleClose={handleModalClose} />
      <Table
        dataSource={userApiKey ? [userApiKey] : []} // for now only 1:1 user : api key
        rowKey={(apiKey) => apiKey.id}
        loading={isUserApiKeyLoading || isGeneratingApiKey}
        bordered
        size="small"
        pagination={{ pageSize: 5 }}
        locale={locale}
      >
        <Table.Column
          title="Created At"
          dataIndex="created_at"
          render={(_, record: UserApiKey) => formatDbTimestamp(record.created_at)}
        />
        <Table.Column
          title="Last Used"
          dataIndex="last_used"
          render={(_, record: UserApiKey) => (record.last_used ? formatDbTimestamp(record.last_used) : 'Never')}
        />
        <Table.Column
          title="Active"
          dataIndex="active"
          render={(_, record: UserApiKey) => `${record.active ? 'Yes' : 'No'}`}
        />
        <Table.Column
          title="Re-generate key"
          render={(_value, _record) => (
            <Button onClick={handleGenerateUserApiKey} loading={isGeneratingApiKey}>
              Regenerate
            </Button>
          )}
        />
      </Table>
    </Space>
  );
}
