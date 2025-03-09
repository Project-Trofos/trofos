import { RobotOutlined } from "@ant-design/icons";
import { Button } from "antd";
import * as motion from "motion/react-client";
import { useRef, useState } from "react";

export default function AiChatButton({ onClick }: {
  onClick: () => void;
}): JSX.Element {
  const constraintsRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div 
      ref={constraintsRef}
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 1000,
      }}
    >
      <motion.div
        drag
        dragConstraints={constraintsRef}
        dragElastic={0.2}
        style={{ display: 'inline-block' }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={isHovered ? { opacity: 1, scale: 1, y: -40, x: -200 } : { opacity: 0, scale: 0.8, y: 10, x: -200 }}
          transition={{ type: 'spring', stiffness: 150, damping: 10 }}
          style={{
            position: 'absolute',
            background: '#fff',
            padding: '8px 12px',
            borderRadius: '12px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
            whiteSpace: 'nowrap',
            fontSize: '14px',
            fontWeight: '500',
          }}
        >
          Need help? Ask TROFOS Copilot!
        </motion.div>
        <motion.div
          initial={{ scale: 1, opacity: 0.8 }}
          animate={{ scale: 1.1, opacity: 1 }}
          whileHover={{ scale: 1.5, rotate: 25 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 200, damping: 10 }}
        >
          <Button
            type="primary"
            shape="circle"
            size="large"
            icon={<RobotOutlined />}
            onClick={onClick}
            style={{
              border: 'none',
              boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}