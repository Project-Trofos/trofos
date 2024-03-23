import React, { useRef } from 'react';
import { Button, Divider, Space, Typography } from 'antd';
import { ReportScrumSection } from '../../components/report/ScrumReport/ReportScrumSection';
import Container from '../../components/layouts/Container';
import ReportStatisticsSection from '../../components/report/ScrumReport/ReportStatisticsSection';
import { ReportStandUpSection } from '../../components/report/ScrumReport/ReportStandUpSection';
import { PrinterOutlined } from '@ant-design/icons';
import ReactToPrint from 'react-to-print';

const { Title } = Typography;

const printReport: React.MouseEventHandler<HTMLElement> = (e: React.MouseEvent<HTMLElement>) => {
  e.preventDefault();
};

export const ProjectReportPage = () => {
  const printRef = useRef<HTMLDivElement>(null);
  return (
    <Container fullWidth>
      <Space style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Title>Projects</Title>
        <ReactToPrint
          bodyClass="print-agreement"
          content={() => printRef.current}
          trigger={() => (
            <Button
              aria-label="print-report"
              onClick={printReport}
              type="primary"
              size="large"
              icon={<PrinterOutlined />}
            >
              Print
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
