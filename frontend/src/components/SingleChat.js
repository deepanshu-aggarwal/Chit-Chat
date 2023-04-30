import React, { useEffect, useState } from "react";
import { useChatState } from "../Context/ChatProvider";
import {
  Box,
  Button,
  FormControl,
  IconButton,
  Input,
  Spinner,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { getSender } from "../utils/logics";
import { ArrowBackIcon, ViewIcon } from "@chakra-ui/icons";
import ProfileModal from "./miscellaneous/ProfileModal";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import axios from "axios";
import ScrollableChat from "./ScrollableChat";
import io from "socket.io-client";

const ENDPOINT = "http://localhost:5000";
let socket, selectedChatCompare;

const SingleChat = () => {
  const { user, selectedChat, setSelectedChat, notification, setNotification } =
    useChatState();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const config = {
    headers: { Authorization: `Bearer ${user?.token}` },
  };

  const sendMessage = async (e) => {
    if (!newMessage) return;
    setNewMessage("");
    socket.emit("stop_typing", selectedChat._id);
    try {
      const { data } = await axios.post(
        "/api/message",
        { content: newMessage, chatId: selectedChat._id },
        config
      );
      if (data?.success) {
        setMessages([...messages, data.data]);
        socket.emit("new_message", data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchMessages = async () => {
    if (!selectedChat) return;
    setLoading(true);
    try {
      const { data } = await axios.get(
        `/api/message/${selectedChat?._id}`,
        config
      );
      if (data?.success) {
        setMessages(data.messages);
        socket.emit("join_chat", selectedChat._id);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const messageHandler = (e) => {
    setNewMessage(e.target.value);

    // Typing handling
    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }

    const lastTypingTime = new Date().getTime();
    const timer = 2000;
    setTimeout(() => {
      const timeDiff = new Date().getTime() - lastTypingTime;
      if (timeDiff >= timer && !typing) {
        socket.emit("stop_typing", selectedChat._id);
        setTyping(false);
      }
    }, timer);
  };

  useEffect(() => {
    fetchMessages();
    selectedChatCompare = { ...selectedChat };
  }, [selectedChat]);

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop_typing", () => setIsTyping(false));
  }, []);

  useEffect(() => {
    socket.on("message_recieved", (newMessageRecieved) => {
      if (
        !selectedChatCompare ||
        selectedChatCompare._id !== newMessageRecieved.chat._id
      ) {
        if (!notification.includes(newMessageRecieved)) {
          setNotification([newMessageRecieved, ...notification]);
        }
      } else {
        setMessages([...messages, newMessageRecieved]);
      }
    });
  });

  return (
    <>
      {selectedChat?.length !== 0 ? (
        <>
          <Box
            fontSize={{ base: "28px", md: "30px" }}
            pb={3}
            px={2}
            w="100%"
            fontFamily="Work sans"
            display="flex"
            justifyContent={{ base: "space-between" }}
            alignItems="center"
          >
            <IconButton
              display={{ base: "flex", md: "none" }}
              icon={<ArrowBackIcon />}
              onClick={() => {
                setSelectedChat("");
              }}
            />
            {!selectedChat.isGroupChat ? (
              <>
                {selectedChat &&
                  user &&
                  getSender(selectedChat.users, user)?.name}
                <ProfileModal user={getSender(selectedChat.users, user)} />
              </>
            ) : (
              <>
                {selectedChat?.chatName}
                <IconButton onClick={onOpen} icon={<ViewIcon />} />
              </>
            )}
          </Box>
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="flex-end"
            p={3}
            bg="#e8e8e8"
            w="100%"
            h="100%"
            borderRadius="lg"
            overflowY="hidden"
          >
            {loading ? (
              <Spinner
                size="xl"
                w={20}
                h={20}
                alignSelf="center"
                margin="auto"
              />
            ) : (
              <>
                <ScrollableChat messages={messages} isTyping={isTyping} />
              </>
            )}
            <FormControl
              onKeyDown={(e) => {
                e.keyCode === 13 && sendMessage();
              }}
              isRequired
              mt={3}
              display="flex"
            >
              <Input
                variant="filled"
                bg="#e0e0e0"
                placeholder="Enter message"
                value={newMessage}
                onChange={messageHandler}
              />
              <Button colorScheme="blue" variant="solid" ml={2}>
                Send
              </Button>
            </FormControl>
          </Box>
        </>
      ) : (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          h="100%"
        >
          <Text fontSize="3xl" pb={3} fontFamily="Work sans">
            Click on a user to chat..
          </Text>
        </Box>
      )}
      <UpdateGroupChatModal onOpen={onOpen} isOpen={isOpen} onClose={onClose} />
    </>
  );
};

export default SingleChat;
