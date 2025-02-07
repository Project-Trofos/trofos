import { Button } from 'antd';
import { useTourContext } from './TourProvider';

export default function TourButton() {
  const { startTour } = useTourContext();

  return <Button onClick={startTour}>Take a Quick Tour</Button>;
}
