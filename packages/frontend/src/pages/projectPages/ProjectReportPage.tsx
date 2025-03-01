import React, { useRef } from 'react';
import { Button, Space, Typography } from 'antd';
import { ReportScrumSection } from '../../components/report/ReportScrumSection';
import Container from '../../components/layouts/Container';
import ReportStatisticsSection from '../../components/report/ReportStatisticsSection';
import { ReportStandUpSection } from '../../components/report/ReportStandUpSection';
import { PrinterOutlined } from '@ant-design/icons';
import ReactToPrint from 'react-to-print';
import { useAppSelector } from '../../app/hooks';

const { Title } = Typography;

export const ProjectReportPage = () => {
  const printRef = useRef<HTMLDivElement>(null);
  const isDarkTheme = useAppSelector((state) => state.localSettingsSlice.isDarkTheme);
  return (
    <Container fullWidth>
      <Space style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Title>Projects</Title>
        <ReactToPrint
          bodyClass="print-agreement"
          content={() => printRef.current}
          trigger={() => (
            <Button
              disabled={isDarkTheme}
              aria-label="print-report"
              type="primary"
              size="large"
              icon={<PrinterOutlined />}
            >
              {isDarkTheme ? 'Switch to light mode to print' : 'Print'}
            </Button>
          )}
        />
      </Space>
      <div ref={printRef}>
        <Title>Project Report</Title>
        <ReportStatisticsSection />
        <ReportScrumSection />
        <ReportStandUpSection />
      </div>
    </Container>
  );
};
