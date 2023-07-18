import React from "react";
import { Box } from "@chakra-ui/react";
import SideDrawer from "../components/miscellaneous/SideDrawer";
import MyChats from "../components/MyChats";
import ChatBox from "../components/ChatBox";
import { useChatState } from "../Context/ChatProvider";

const ChatPage = () => {
  const { user } = useChatState();

  return (
    <div style={{ width: "100%" }}>
      {user.token && <SideDrawer />}
      <Box
        display="flex"
        w="100%"
        justifyContent="space-between"
        height="90vh"
        p="10px 10px 0px 10px"
      >
        {user.token ? <MyChats /> : <></>}
        {user.token ? <ChatBox /> : <></>}
      </Box>
    </div>
  );
};

export default ChatPage;
