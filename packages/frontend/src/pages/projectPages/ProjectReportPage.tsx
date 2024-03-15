import React from 'react';
import { Typography } from 'antd';
import { ReportScrumSection } from '../../components/report/ScrumReport/ReportScrumSection';

const { Title } = Typography;

export const ProjectReportPage = () => {
  return (
    <div>
      <Title>Project Report</Title>
      <ReportScrumSection />
    </div>
  );
};
