import React, { useState, useEffect } from 'react';
import { message, Modal, Button, Space, Popover, Typography, Dropdown, DropdownProps } from 'antd';
import { useGetUserInfoQuery } from '../../api/auth';
import { useRecommendUserGuideSectionsMutation } from '../../api/ai';
import { UserGuideRecommendation } from '../../api/types';
import { getErrorMessage } from '../../helpers/error';
import { Link } from 'react-router-dom';
import { LoadingOutlined, MonitorOutlined } from '@ant-design/icons';

const { Text } = Typography;

const RecommendGuide = () => {
  const [isPopOverOpen, setIsPopOverOpen] = useState(false);
  const [recommend, { isLoading: isLoading }] = useRecommendUserGuideSectionsMutation();
  const [recommendations, setRecommendations] = useState<UserGuideRecommendation[]>([]);

  const handlePopoverOpenChange = (newOpen: boolean) => {
    setIsPopOverOpen(newOpen);
  };

  const handleRecommend = async () => {
    try {
      const response = await recommend().unwrap();
      if (response) {
        setRecommendations(response);
        setIsPopOverOpen(true);
      }
    } catch (error) {
      console.error(getErrorMessage(error));
      message.error('Failed to load popup.');
    }
  };

  const recommendationContent = (
    <Space direction="vertical" size="small">
      {recommendations.map((recommendation, idx) => (
        <Link key={idx} to={recommendation.endpoint} target="_blank" rel="noopener noreferrer">
          {idx + 1}. {recommendation.section_title}
        </Link>
      ))}
    </Space>
  );

  return (
    <Popover
      content={recommendationContent}
      title="Recommended User Guide sections"
      trigger="contextMenu"
      open={isPopOverOpen}
      onOpenChange={handlePopoverOpenChange}
      placement="bottomRight"
    >
      <Space onClick={handleRecommend}>
        {isLoading ? <LoadingOutlined /> : <MonitorOutlined />}
        <Text>{isLoading ? 'Loading...' : 'Suggest'}</Text>
      </Space>
    </Popover>
  );
};

export default RecommendGuide;
