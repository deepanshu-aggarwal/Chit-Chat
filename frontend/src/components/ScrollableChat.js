import {
  Avatar,
  Box,
  Button,
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Tooltip,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";
import React, { useState } from "react";
import ScrollableFeed from "react-scrollable-feed";
import { useChatState } from "../Context/ChatProvider";
import {
  getMessageTime,
  getSender,
  isFirstMessage,
  isLastMessage,
  isSameSender,
  isSameSenderMargin,
  isSameSenderMessage,
  isSameUser,
} from "../utils/logics";
// import Lottie from "react-lottie";
// import TypingAnimation from "../animations/typing.json";
import axios from "axios";

const ScrollableChat = ({ messages, setMessages, isTyping }) => {
  const toast = useToast();
  const { user, selectedChat, setRefresh } = useChatState();
  const [hoverMessage, setHoverMessage] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const config = {
    headers: { Authorization: `Bearer ${user?.token}` },
  };

  // const defaultOptions = {
  //   loop: true,
  //   autoplay: true,
  //   animationData: TypingAnimation,
  //   rendererSettings: {
  //     preserveAspectRatio: "xMidYMid slice",
  //   },
  // };

  const handleHoverIn = (messageId) => setHoverMessage(messageId);

  const handleHoverOut = () => setHoverMessage(null);

  const handleDeleteMessage = async () => {
    try {
      const { data } = await axios.delete(
        `/api/message/delete/${selectedMessage}`,
        config
      );
      if (data?.success) {
        const updatedMessages = messages.filter(
          (m) => m._id !== selectedMessage
        );
        setMessages(updatedMessages);
        setRefresh((prev) => !prev);
        onClose();
        toast({
          title: "Message deleted successfully",
          status: "success",
          duration: 1000,
          isClosable: true,
          position: "top",
        });
      }
    } catch (error) {
      console.log(error);
    }
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
            <div
              style={{
                padding: "5px 10px",
                borderRadius: "15px",
                maxWidth: "75%",
                backgroundColor:
                  message.sender._id !== user._id ? "#bee3f8" : "#b9f5d0",
                marginLeft: isSameSenderMargin(messages, idx, user._id),
              }}
              onMouseEnter={() => handleHoverIn(message._id)}
              onMouseLeave={handleHoverOut}
            >
              {(isSameSenderMessage(messages, idx, user._id) ||
                isFirstMessage(messages, idx, user._id)) &&
                selectedChat.isGroupChat && (
                  <div
                    style={{
                      color: "darkblue",
                      fontWeight: "bold",
                      fontSize: "10px",
                    }}
                  >
                    {getSender(selectedChat.users, user).name}
                  </div>
                )}
              <>
                <div>{message.content}</div>
                <div
                  style={{
                    fontSize: "10px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    color: "gray",
                    marginTop: "2px",
                    gap: "5px",
                  }}
                >
                  {hoverMessage === message._id &&
                    message.sender._id === user._id && (
                      <DeleteIcon
                        fontSize={10}
                        cursor="pointer"
                        color="gray.500"
                        onClick={() => {
                          onOpen();
                          setSelectedMessage(message._id);
                        }}
                      />
                    )}
                  {getMessageTime(message.createdAt)}
                </div>
              </>
            </div>
          </div>
        ))}
        {isTyping ? (
          // <Lottie
          //   options={defaultOptions}
          //   style={{ overflow: "none", margin: "0 0 0 36px" }}
          //   width={71}
          //   height={34}
          // />
          <div>Typing...</div>
        ) : (
          <></>
        )}
      </ScrollableFeed>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>Do you want to delete message?</ModalHeader>
          <ModalCloseButton />
          <ModalFooter>
            <Button mr={2} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={handleDeleteMessage}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ScrollableChat;
