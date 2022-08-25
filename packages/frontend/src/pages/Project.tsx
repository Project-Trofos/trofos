import React from 'react';
import { useParams } from 'react-router-dom';
import { Typography } from 'antd';

const { Title } = Typography;

export default function ProjectPage(): JSX.Element {
  const params = useParams();
  return <Title>{`Project ID: ${params.projectId}`}</Title>;
}
