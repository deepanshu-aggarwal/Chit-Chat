import { Avatar, Box, Tooltip } from "@chakra-ui/react";
import React from "react";
import ScrollableFeed from "react-scrollable-feed";
import { useChatState } from "../Context/ChatProvider";
import {
  isLastMessage,
  isSameSender,
  isSameSenderMargin,
  isSameUser,
} from "../utils/logics";
import Lottie from "react-lottie";
import TypingAnimation from "../animations/typing.json";

const ScrollableChat = ({ messages, isTyping }) => {
  const { user } = useChatState();

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: TypingAnimation,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  return (
    <Box display="flex" flexDirection="column" overflowY="scroll">
      <ScrollableFeed>
        {messages?.map((message, idx) => (
          <div
            key={message._id}
            style={{
              marginBottom: isSameUser(messages, idx) ? 3 : 10,
              display: "flex",
              alignItems: "center",
              justifyContent:
                message.sender._id === user._id ? "flex-end" : "flex-start",
            }}
          >
            {(isSameSender(messages, idx, user._id) ||
              isLastMessage(messages, idx, user._id)) && (
              <Tooltip
                label={message.sender.name}
                placement="bottom-start"
                hasArrow
              >
                <Avatar
                  src={message.sender.pic}
                  alt="https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"
                  size="sm"
                  cursor="pointer"
                  mr={1}
                />
              </Tooltip>
            )}
            <span
              style={{
                padding: "5px 15px",
                borderRadius: "20px",
                maxWidth: "75%",
                backgroundColor:
                  message.sender._id !== user._id ? "#bee3f8" : "#b9f5d0",
                marginLeft: isSameSenderMargin(messages, idx, user._id),
              }}
            >
              {message.content}
            </span>
          </div>
        ))}
        {isTyping ? (
          <Lottie
            options={defaultOptions}
            style={{ overflow: "none", margin: "0 0 0 36px" }}
            width={71}
            height={34}
          />
        ) : (
          <></>
        )}
      </ScrollableFeed>
    </Box>
  );
};

export default ScrollableChat;
