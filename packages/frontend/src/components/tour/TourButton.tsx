import { Button } from 'antd';
import { useTourContext } from './TourProvider';
import { STEP_PROP, StepTarget } from './TourSteps';

export default function TourButton() {
  const { startTour } = useTourContext();

  return (
    <Button {...{ [STEP_PROP]: StepTarget.START_TOUR_BUTTON }} onClick={startTour}>
      Take a Quick Tour
    </Button>
  );
}
