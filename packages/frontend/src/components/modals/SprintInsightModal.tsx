import { Badge, Button, Card, Empty, Modal, Spin, Tabs, Tooltip } from "antd";
import { useRef, useState } from "react";
import { useGetSprintInsightsQuery } from "../../api/sprint";
import * as motion from "motion/react-client";
import { AnimatePresence, MotionValue, useScroll, useSpring, useTransform } from "motion/react";
import { SprintInsight } from "../../api/types";
import MarkdownViewer from "../editor/MarkdownViewer";
import { markSprintAsSeen } from "../../app/localSettingsSlice";
import { useAppDispatch, useAppSelector } from "../../app/hooks";

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
  isGenerating,
}: {
  sprintId: number | undefined;
  isGenerating: boolean;
}) {
  if (!sprintId) {
    return null;
  }

  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: sprintInsights } = useGetSprintInsightsQuery(sprintId);
  const dispatch = useAppDispatch();
  const hasSeenThisSprintInsight = useAppSelector((state) => state.localSettingsSlice.seenRetrospectiveInsights[sprintId.toString()] ?? false);

  // update browser local storage key-value to set seen flag for this sprint
  if (!isGenerating && sprintInsights && sprintInsights.length > 0 && isModalOpen) {
    dispatch(markSprintAsSeen(sprintId.toString()));
  }

  return (
    <>
      {hasSeenThisSprintInsight ?
        (<HoverTextButton onClick={() => setIsModalOpen(true)}/>) :
        (<Tooltip title="View sprint insights">
          <Badge count={sprintInsights?.length}>
            <HoverTextButton onClick={() => setIsModalOpen(true)} />
          </Badge>
        </Tooltip>)
      }
      <Modal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        style={{
          height: '80vh',
          overflowY: 'auto',
          borderRadius: '10px',
        }}
        width={'80vw'}
        footer={[
          <Button key="close" onClick={() => setIsModalOpen(false)}>
            Close
          </Button>
        ]}
      >
        {isGenerating ? (
          <Spin />
        ) : (
          sprintInsights && sprintInsights.length > 0 ? (
            <Tabs
              items={sprintInsights?.map((insight) => ({
                key: `${insight.id}`,
                label: insight.category,
                children: <Insight key={insight.id} insight={insight} />,
              })) ?? []}
            />
          ) : (
            <Empty />
          )
        )}
      </Modal>
    </>
  );
}

export default SprintInsightModal;
