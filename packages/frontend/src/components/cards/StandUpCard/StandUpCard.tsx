import { useState } from 'react';
import { Button, Dropdown, Typography } from 'antd';
import { SettingOutlined } from '@ant-design/icons';

import { StandUp } from '../../../api/standup';
import SimpleCard from '../SimpleCard';
import { Link } from 'react-router-dom';
import StandUpUpdateModal from '../../modals/StandUpUpdateModal';
import dayjs from 'dayjs';
import useStandUpCardMenu from './useStandUpCardMenu';

const { Title } = Typography;

export default function StandUpCard(props: { standUp: StandUp }): JSX.Element {
  const { standUp } = props;
  const dateString = dayjs(standUp.date).format('ddd, DD MMM YYYY');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { menu } = useStandUpCardMenu(standUp, setIsModalOpen);

  return (
    <SimpleCard
      content={
        <Title level={4}>
          <Link to={`${standUp.standUpId}`}>{dateString}</Link>
        </Title>
      }
      action={
        <>
          <Dropdown menu={menu}>
            <Button type="text" shape="circle">
              <SettingOutlined />
            </Button>
          </Dropdown>
          <StandUpUpdateModal
            isModalOpen={isModalOpen}
            setIsModalOpen={setIsModalOpen}
            projectId={standUp.projectId}
            standUpId={standUp.standUpId}
          />
        </>
      }
    />
  );
}
