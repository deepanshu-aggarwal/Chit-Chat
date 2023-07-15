import React, { useEffect } from "react";
import { useChatState } from "../Context/ChatProvider";
import { Box, Button, Stack, Text, useDisclosure } from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import axios from "axios";
import ChatSkeleton from "./ChatSkeleton";
import GroupChatModal from "./miscellaneous/GroupChatModal";
import { getMessageSenderById, getSender } from "../utils/logics";

const MyChats = () => {
  const { chats, setChats, selectedChat, setSelectedChat, user, refresh } =
    useChatState();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const currentDate = new Date();

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
      alignItems="center"
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
      <Box
        display="flex"
        flexDir="column"
        p={3}
        bg="#f8f8f8"
        w="100%"
        h="100%"
        borderRadius="lg"
        overflowY="hidden"
      >
        {chats ? (
          <Stack overflowY="scroll">
            {chats?.map((chat) => (
              <Box
                key={chat._id}
                cursor="pointer"
                bg={selectedChat._id === chat._id ? "#38b2ac" : "#e8e8e8"}
                color={selectedChat._id === chat._id ? "white" : "black"}
                px={3}
                py={2}
                borderRadius="lg"
                onClick={() => setSelectedChat(chat)}
              >
                <Text
                  fontSize={16}
                >
                  {!chat.isGroupChat
                    ? getSender(chat.users, user).name
                    : chat.chatName}
                </Text>
                <Box
                  display='flex'
                  justifyContent='space-between'
                >
                  <Text
                    fontSize={14}
                    fontWeight={600}
                  >
                    {chat.isGroupChat ? `${getMessageSenderById(chat.users, chat.latestMessage.sender, user)} : ` : ''}
                    {chat.latestMessage.content}
                  </Text>
                  <Text
                    fontSize={12}
                    color={selectedChat._id === chat._id ? "white" : "gray"}
                    fontWeight={500}
                  >
                    {
                      new Date(chat.latestMessage.createdAt).toDateString() === currentDate.toDateString() ?
                      new Date(chat.latestMessage.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      }) :
                      new Date(chat.latestMessage.createdAt).toLocaleString([], {
                        dateStyle: "short",
                        timeStyle: "short",
                      })
                    } 
                  </Text>
                </Box>
              </Box>
            ))}
          </Stack>
        ) : (
          <ChatSkeleton />
        )}
      </Box>
      <GroupChatModal isOpen={isOpen} onOpen={onOpen} onClose={onClose} />
    </Box>
  );
};

export default MyChats;
