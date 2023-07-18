import React, { useEffect } from "react";
import { useChatState } from "../Context/ChatProvider";
import {
  Avatar,
  Box,
  Button,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import axios from "axios";
import ChatSkeleton from "./ChatSkeleton";
import GroupChatModal from "./miscellaneous/GroupChatModal";
import {
  getMessageSenderById,
  getMessageTime,
  getSender,
} from "../utils/logics";

const MyChats = () => {
  const { chats, setChats, selectedChat, setSelectedChat, user, refresh } =
    useChatState();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const fetchChats = async () => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${user?.token}` },
      };
      const { data } = await axios.get("/api/chat", config);
      if (data?.success) setChats(data?.chats);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchChats();
  }, [refresh]);

  return (
    <Box
      display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
      flexDir="column"
      p={3}
      bg="white"
      w={{ base: "100%", md: "31%" }}
      borderRadius="lg"
      borderWidth="1px"
    >
      <Box
        p={3}
        fontSize={{ base: "28px", md: "30px" }}
        fontFamily="Work sans"
        display="flex"
        w="100%"
        justifyContent="space-between"
        alignItems="center"
      >
        My Chats
        <Button
          display="flex"
          fontSize={{ base: "17px", md: "10px", lg: "17px" }}
          rightIcon={<AddIcon />}
          onClick={onOpen}
        >
          New Group Chat
        </Button>
      </Box>
      {chats ? (
        <Stack
          overflowY="scroll"
          display="flex"
          flexDir="column"
          p={3}
          bg="#f8f8f8"
          w="100%"
          h="100%"
          borderRadius="lg"
        >
          {chats?.map((chat) => (
            <Box
              key={chat._id}
              cursor="pointer"
              display="flex"
              gap={5}
              bg={selectedChat._id === chat._id ? "#38b2ac" : "#e8e8e8"}
              color={selectedChat._id === chat._id ? "white" : "black"}
              px={3}
              py={2}
              borderRadius="lg"
              onClick={() => setSelectedChat(chat)}
            >
              <Avatar
                src={
                  chat.isGroupChat
                    ? `https://icon-library.com/images/user-icon-png-transparent/user-icon-png-transparent-10.jpg`
                    : `https://icon-library.com/images/google-user-icon/google-user-icon-6.jpg`
                }
              />
              <Box width="100%">
                <Text fontSize={16}>
                  {!chat.isGroupChat
                    ? getSender(chat.users, user).name
                    : chat.chatName}
                </Text>
                <Box display="flex" justifyContent="space-between">
                  <Text fontSize={14} fontWeight={600}>
                    {chat.isGroupChat
                      ? `${getMessageSenderById(
                          chat.users,
                          chat?.latestMessage?.sender,
                          user
                        )} : `
                      : ""}
                    {chat?.latestMessage?.content.substring(0, 20) +
                      (chat?.latestMessage?.content.length > 20 ? "..." : "") ||
                      "Start a conversation"}
                  </Text>
                  <Text
                    fontSize={12}
                    color={selectedChat._id === chat._id ? "white" : "gray"}
                    fontWeight={500}
                    alignSelf="flex-end"
                  >
                    {chat?.latestMessage
                      ? getMessageTime(chat?.latestMessage?.createdAt)
                      : ""}
                  </Text>
                </Box>
              </Box>
            </Box>
          ))}
        </Stack>
      ) : (
        <ChatSkeleton />
      )}
      <GroupChatModal isOpen={isOpen} onOpen={onOpen} onClose={onClose} />
    </Box>
  );
};

export default MyChats;
