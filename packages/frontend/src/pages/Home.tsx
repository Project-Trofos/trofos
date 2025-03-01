import React from 'react';
import { Button, Space, Row, Col, Image, Carousel, Form, Input, Card } from 'antd';
import { GithubOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useGetUserInfoQuery } from '../api/auth';
import FacultyDashboard from './FacultyDashboard';
import conditionalRender from '../helpers/conditionalRender';
import { UserPermissionActions } from '../helpers/constants';
import UserDashboard from './UserDashboard';
import Container from '../components/layouts/Container';
import TypeWriter from 'typewriter-effect';

import './Home.css';
import LoadingComponent from '../components/common/LoadingComponent';

type FeatureInfo = {
  imgSrc: string;
  title: string;
};

export default function HomePage(): JSX.Element {
  const { data: userInfo, isLoading } = useGetUserInfoQuery();

  if (isLoading) {
    return <LoadingComponent />;
  }

  const features: FeatureInfo[] = [
    {
      imgSrc: 'feature-1.png',
      title: 'Track project and sprint summary',
    },
    {
      imgSrc: 'feature-2.png',
      title: 'Organise sprints and backlogs',
    },
    {
      imgSrc: 'feature-5.png',
      title: 'Manage project users and roles',
    },
    {
      imgSrc: 'feature-4.png',
      title: 'Track progress within a sprint',
    },
    {
      imgSrc: 'feature-3.png',
      title: 'Compare statistics across sprints',
    },
  ];

  const Header = () => (
    <Row justify={'space-between'} align={'middle'} style={{ padding: '0 20px' }}>
      <Col className="header-logo">
        <Image width={40} src="favicon.ico" preview={false} />
        <div className="logo-text">TROFOS</div>
      </Col>
      <Col>
        <Link to="/login">
          <Button type="primary">Login</Button>
        </Link>
      </Col>
    </Row>
  );

  const Body = () => (
    <div className="body">
      <div style={{ marginBottom: '3rem' }}>
        <TypeWriter
          options={{ wrapperClassName: 'title', cursorClassName: 'title', loop: true }}
          onInit={(typewriter) => {
            typewriter
              .typeString('A <strong>one-stop</strong> platform for project management')
              .pauseFor(3000)
              .deleteChars(18) // Deletes "project management"
              .typeString('organising sprints')
              .pauseFor(3000)
              .deleteChars(18) // Deletes "organising sprints"
              .typeString('project analytics')
              .pauseFor(3000)
              .deleteChars(17) // Deletes "project analytics"
              .typeString('sprint retrospectives')
              .pauseFor(3000)
              .start();
          }}
        />
      </div>
      <Button href="https://github.com/Project-Trofos/trofos" icon={<GithubOutlined />} size="large" type="default">
        GitHub
      </Button>
    </div>
  );

  const Features = () => (
    <Space direction="vertical" size={'large'}>
      <h1 className="content-header">Features</h1>
      <div className="features-desc">
        TROFOS, is intended to be the academic counterpart of Jira, equipping students with a tool that mirrors Jira's
        capabilities to develop a grasp of agile methodologies, aligning with industry practices.
      </div>
      <Carousel
        autoplay
        adaptiveHeight
        fade
        autoplaySpeed={5000}
        style={{ padding: '20px', height: '600', backgroundColor: 'none' }}
      >
        {features.map((feature, idx) => (
          <div key={idx} className="feature-container">
            <img src={feature.imgSrc} alt={feature.title} height={'400'} />
            <p className="feature-title">{feature.title}</p>
          </div>
        ))}
      </Carousel>
    </Space>
  );

  const ContactUs = () => (
    <Space direction="vertical" size={'large'}>
      <h1 className="content-header" style={{ color: '#ffffff' }}>
        Contact Us
      </h1>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Card className="contact-us-container">
          <Form layout="vertical">
            <Form.Item label="Name" name="name">
              <Input placeholder="John Doe" />
            </Form.Item>
            <Form.Item label="Email" name="email" required>
              <Input placeholder="youremail@domain.com" />
            </Form.Item>

            <Form.Item label="Content" name="email-content" required>
              <Input.TextArea placeholder="How do I create an independent project?" rows={4} />
            </Form.Item>

            <Form.Item style={{ display: 'flex', flexDirection: 'row-reverse' }}>
              <Button type="primary" htmlType="submit">
                Send
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </Space>
  );

  // User is not logged in
  if (!userInfo) {
    return (
      <div className="background">
        <Container className="main-content-container centralize-content" noGap>
          <Header />
          <Body />
          <Features />
          <ContactUs />
        </Container>
      </div>
    );
  }

  return conditionalRender(
    <FacultyDashboard userInfo={userInfo} />,
    userInfo.userRoleActions,
    [UserPermissionActions.CREATE_COURSE, UserPermissionActions.ADMIN],
    <UserDashboard userInfo={userInfo} />,
  );
}
