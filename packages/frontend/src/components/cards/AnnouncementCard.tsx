import React from 'react';
import { Button, Card, List } from 'antd';
import { DeleteOutlined, UserOutlined } from '@ant-design/icons';

import { Subheading } from '../typography';
import { CourseData } from '../../api/types';
import AnnouncementCreationModal from '../modals/AnnouncementCreationModal';
import AvatarWithName from '../avatar/Avatar';
import Timestamp from '../common/Timestamp';
import AnnouncementUpdateModal from '../modals/AnnouncementUpdateModal';

import './CommonCard.css';
import './AnnouncementCard.css';

type AnnouncementCardProps = {
  course?: CourseData;
  showEdit?: boolean;
  handleDeleteAnnouncement: (announcementId: number) => Promise<void>;
  handleUpdateAnnouncement: (
    announcementId: number,
    payload: { announcementTitle?: string; announcementContent?: string },
  ) => Promise<void>;
};

export default function AnnouncementCard(props: AnnouncementCardProps): JSX.Element {
  const { course, showEdit = false, handleDeleteAnnouncement, handleUpdateAnnouncement } = props;

  return (
    <Card className="common-card announcement-card">
      <div className="common-card-header">
        <Subheading className="title">Announcements</Subheading>
        {course && showEdit && <AnnouncementCreationModal courseId={course.id.toString()} />}
      </div>
      <List
        itemLayout="vertical"
        bordered
        pagination={{ pageSize: 3 }}
        dataSource={course?.announcements}
        renderItem={(announcement) => (
          <List.Item key={announcement.id}>
            <List.Item.Meta
              title={
                <div className="announcement-card-title-container">
                  {announcement.title}
                  {showEdit && (
                    <div className="announcement-card-title-button-group">
                      <AnnouncementUpdateModal
                        initialTitle={announcement.title}
                        initialContent={announcement.content}
                        handleUpdate={(payload) => handleUpdateAnnouncement(announcement.id, payload)}
                      />
                      <Button size="small" danger onClick={() => handleDeleteAnnouncement(announcement.id)}>
                        <DeleteOutlined />
                      </Button>
                    </div>
                  )}
                </div>
              }
              description={
                <>
                  <Timestamp createdAt={announcement.created_at} updatedAt={announcement.updated_at} />
                  {announcement.user_id && (
                    <AvatarWithName
                      icon={<UserOutlined />}
                      // Will update to showing username after the API is available
                      username={course?.users.find((u) => u.user.user_id === announcement.user_id)?.user.user_email}
                    />
                  )}
                </>
              }
            />
            <section className="announcement-card-content">{announcement.content}</section>
          </List.Item>
        )}
      />
    </Card>
  );
}
