import { Flex, Spin, Typography } from "antd";
import * as motion from "motion/react-client";
import { AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";

const defaultLoadingTexts = [
  "Warming up the servers...",
  "Brewing some fresh content...",
  "Counting to infinity (almost there)...",
  "Awaiting divine intervention...",
  "Pushing the pixels...",
];

const LoadingComponent = ({
  loadingTextArr,
}: {
  loadingTextArr?: string[];
}) => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [showFavicon, setShowFavicon] = useState(true);
  const loadingTexts = loadingTextArr || defaultLoadingTexts;

  // show simple loading for short duration - longer show other loading
  useEffect(() => {
    const faviconTimer = setTimeout(() => {
      setShowFavicon(false);
    }, 500);

    return () => clearTimeout(faviconTimer);
  }, []);

  useEffect(() => {
    if (!showFavicon) {
      const interval = setInterval(() => {
        setCurrentTextIndex((prev) => (prev + 1) % loadingTexts.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [showFavicon]);

  return (
    <Flex vertical justify="center" align="center" style={{ height: "30vh" }}>
      {showFavicon ? (
        <>
          <Spin size="large" />
          <Typography.Title level={4} style={{ marginTop: 10 }}>
            Loading...
          </Typography.Title>
        </>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            animate={{
              scale: [1, 2, 2, 1, 1],
              rotate: [0, 0, 180, 180, 0],
              borderRadius: ["0%", "0%", "50%", "50%", "0%"],
              backgroundImage: [
                "linear-gradient(45deg, #ff0000, #ff7300)",
                "linear-gradient(45deg, #ff7300, #ffff00)",
                "linear-gradient(45deg, #ffff00, #00ff00)",
                "linear-gradient(45deg, #00ff00, #0000ff)",
                "linear-gradient(45deg, #0000ff, #ff00ff)",
              ],
            }}
            transition={{
              duration: 2,
              ease: "easeInOut",
              times: [0, 0.2, 0.4, 0.6, 0.8],
              repeat: Infinity,
              repeatDelay: 1,
            }}
            style={{
              width: 50,
              height: 50,
              backgroundSize: "200% 200%",
            }}
          />
          <motion.div key="loading-text">
            <motion.p
              key={currentTextIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              style={{ marginTop: 30, fontSize: 16 }}
            >
              {loadingTexts[currentTextIndex]}
            </motion.p>
          </motion.div>
        </AnimatePresence>
      )}
    </Flex>
  );
};

export default LoadingComponent;
