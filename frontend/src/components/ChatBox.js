import React from "react";
import { useChatState } from "../Context/ChatProvider";
import { Box } from "@chakra-ui/react";
import SingleChat from "./SingleChat";

const ChatBox = () => {
  const { selectedChat } = useChatState();

  return (
    <Box
      display={{ base: selectedChat ? "block" : "none", md: "flex" }}
      flexDirection="column"
      p={3}
      bgColor="white"
      w={{ base: "100%", md: "68%" }}
      borderRadius="lg"
      borderWidth="1px"
    >
      <SingleChat />
    </Box>
  );
};

export default ChatBox;
