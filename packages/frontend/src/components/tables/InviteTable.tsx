import React from 'react';
import { Button, message, Space, Table, Tag } from 'antd';
import { Subheading } from '../typography';
import { Invite } from '../../api/types';
import { UserInfo } from '../../api/auth';

type InviteTableProps = {
  invites?: Invite[];
  userInfo?: UserInfo;
  onResendInvite?: (destEmail: string) => void;
};

export default function InviteTable(props: InviteTableProps) {
  const { invites, userInfo, onResendInvite } = props;

  return (
    <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
      <Space style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Subheading>Invites</Subheading>
      </Space>
      <Table dataSource={invites} rowKey={(invite) => invite.email} bordered size="small">
        <Table.Column
          width={150}
          title="Email"
          dataIndex={'email'}
          sorter={(a: Invite, b: Invite) => a.email.localeCompare(b.email)}
        />
        <Table.Column
          width={150}
          title="Expiry date"
          dataIndex={'expiry_date'}
          sorter={(a: Invite, b: Invite) => a.expiry_date.valueOf() - b.expiry_date.valueOf()}
        />
        <Table.Column
          width={150}
          title="Action"
          dataIndex="action"
          render={(_, record: Invite) => (
            <Space size="middle">
              {onResendInvite && (
                <Button
                  size="small"
                  onClick={() => {
                    if (userInfo) {
                      onResendInvite(record.email);
                    }
                  }}
                >
                  Resend
                </Button>
              )}
            </Space>
          )}
        />
      </Table>
    </Space>
  );
}
