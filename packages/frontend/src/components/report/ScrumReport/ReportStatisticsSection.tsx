import React from 'react';
import Container from '../../layouts/Container';
import { Typography } from 'antd';
import ProjectSummaryCard from '../../cards/ProjectSummaryCard';

type ReportStatisticsSectionProps = {};

const ReportStatisticsSection: React.FC<ReportStatisticsSectionProps> = () => {
  return (
    <Container noGap>
      <Typography.Title>Project Overview</Typography.Title>
      <ProjectSummaryCard />
    </Container>
  );
};

export default ReportStatisticsSection;
