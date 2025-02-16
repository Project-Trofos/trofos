import { Button, Card, Modal } from "antd";
import { useRef, useState } from "react";
import { useGetSprintInsightsQuery } from "../../api/sprint";
import * as motion from "motion/react-client";
import { AnimatePresence, MotionValue, useScroll, useSpring, useTransform } from "motion/react";
import { SprintInsight } from "../../api/types";
import MarkdownViewer from "../editor/MarkdownViewer";

const HoverTextButton = ({
  onClick,
}: {
  onClick?: () => void;
}) => {
  const textState = {
    0: 'View TROFOS copilot insights ✨',
    1: 'Level up with personalized insights 🚀',
  };

  const [text, setText] = useState(textState[0]);

  return (
    <motion.div
      initial={{ width: 'auto' }}
      animate={{ width: text === textState[0] ? '220px' : '250px' }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
      style={{ display: 'inline-block' }}
    >
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onHoverStart={() => setText(textState[1])}
        onHoverEnd={() => setText(textState[0])}
      >
        <Button
          type="primary"
          style={{ width: '100%' }}
          onClick={onClick}
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={text}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
              style={{ display: 'inline-block' }}
            >
              {text}
            </motion.span>
          </AnimatePresence>
        </Button>
      </motion.div>
    </motion.div>
  );
};

function Insight({ insight }: { insight: SprintInsight }) {
  return (
    <Card className="insight-card">
      <MarkdownViewer markdown={insight.content} />
    </Card>
  );
}

function SprintInsightModal({
  sprintId,
}: {
  sprintId: number | undefined;
}) {
  if (!sprintId) {
    return null;
  }

  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: sprintInsights } = useGetSprintInsightsQuery(sprintId);

  return (
    <>
      <HoverTextButton onClick={() => setIsModalOpen(true)}/>
      <Modal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        style={{
          height: '80vh',
          overflowY: 'auto',
          borderRadius: '10px',
        }}
        footer={[
          <Button key="close" onClick={() => setIsModalOpen(false)}>
            Close
          </Button>
        ]}
      >
        {sprintInsights?.map((insight) => (
          <Insight key={insight.id} insight={insight} />
        ))}
      </Modal>
    </>
  );
}

export default SprintInsightModal;
