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
import { ArrowBackIcon, AttachmentIcon, ViewIcon } from "@chakra-ui/icons";
import ProfileModal from "./miscellaneous/ProfileModal";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import axios from "axios";
import ScrollableChat from "./ScrollableChat";
import io from "socket.io-client";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";

const ENDPOINT = "http://localhost:5000";
let socket, selectedChatCompare;

const SingleChat = () => {
  const {
    user,
    selectedChat,
    setSelectedChat,
    notification,
    setNotification,
    setRefresh,
  } = useChatState();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const config = {
    headers: { Authorization: `Bearer ${user?.token}` },
  };

  function handleEmojiClick(emojiData, e) {
    setNewMessage((prev) => prev + emojiData.native);
    setShowPicker(false);
  }

  const sendMessage = async (e) => {
    if (!newMessage) return;
    socket.emit("stop_typing", selectedChat._id);
    try {
      const { data } = await axios.post(
        "/api/message",
        {
          content: newMessage,
          chatId: selectedChat._id,
        },
        config
      );
      if (data?.success) {
        setMessages([...messages, data.data]);
        socket.emit("new_message", data.data);
      }
      setRefresh((prev) => !prev);
    } catch (error) {
      console.log(error);
    } finally {
      setNewMessage("");
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
      {Object.keys(selectedChat).length !== 0 ? (
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
              <ScrollableChat
                messages={messages}
                setMessages={setMessages}
                isTyping={isTyping}
              />
            )}
            <Box display="flex" alignItems="center" mt={3}>
              <img
                src={`https://icons.getbootstrap.com/assets/icons/emoji-smile.svg`}
                alt="Emoji"
                style={{
                  width: "25px",
                  height: "25px",
                  cursor: "pointer",
                  margin: "5px",
                }}
                onClick={() => setShowPicker((prev) => !prev)}
              />
              {showPicker && (
                <div style={{ position: "absolute", bottom: "85px" }}>
                  <Picker data={data} onEmojiSelect={handleEmojiClick} st />
                </div>
              )}
              <AttachmentIcon fontSize={25} m={2} cursor="pointer" />
              <FormControl
                onKeyDown={(e) => {
                  e.keyCode === 13 && sendMessage();
                }}
                isRequired
                display="flex"
                alignItems="center"
              >
                <Input
                  variant="filled"
                  bg="#e0e0e0"
                  placeholder="Enter message"
                  value={newMessage}
                  onChange={messageHandler}
                />
                <Button
                  colorScheme="blue"
                  variant="solid"
                  ml={2}
                  onClick={sendMessage}
                >
                  Send
                </Button>
              </FormControl>
            </Box>
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
