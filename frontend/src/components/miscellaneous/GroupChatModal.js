import {
  Box,
  Button,
  FormControl,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useToast,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { useChatState } from "../../Context/ChatProvider";
import axios from "axios";
import UserListItem from "../UserAvatar/UserListItem";
import UserBadgeItem from "../UserAvatar/UserBadgeItem";

const GroupChatModal = ({ isOpen, onOpen, onClose }) => {
  const [groupChatName, setGroupChatName] = useState("");
  const [groupMembers, setGroupMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const { user, chats, setChats, setSelectedChat } = useChatState();
  const config = {
    headers: { Authorization: `Bearer ${user?.token}` },
  };

  const handleSearch = async (query) => {
    setSearch(query);
    if (!query) return;
    setLoading(true);
    try {
      const { data } = await axios.get(`/api/user?search=${search}`, config);
      setSearchResult(data.users);
      console.log(data.users);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!groupChatName || !groupMembers) {
      toast({
        title: "All fields are required",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    } else if (groupMembers.length < 2) {
      toast({
        title: "Group should be minimum of 3",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }
    try {
      const { data } = await axios.post(
        "api/chat/group",
        {
          name: groupChatName,
          users: JSON.stringify(groupMembers.map((member) => member._id)),
        },
        config
      );
      if (data?.success) {
        setChats([data.chat, ...chats]);
        setSelectedChat(data.chat);
        toast({
          title: "Group Created",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
      }
    } catch (error) {
      console.log(error);
    } finally {
      onClose();
    }
  };

  const handleAddUser = (user) => {
    if (groupMembers.includes(user)) {
      toast({
        title: "User already added",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }
    setGroupMembers([...groupMembers, user]);
  };

  const handleDelete = (member) => {
    setGroupMembers(groupMembers.filter((user) => user._id !== member._id));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader
          fontSize="35px"
          fontFamily="Work sans"
          display="flex"
          justifyContent="center"
        >
          Create Group Chat
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody display="flex" flexDirection="column" alignItems="center">
          <FormControl>
            <Input
              placeholder="Chat Name"
              mb={3}
              value={groupChatName}
              onChange={(e) => setGroupChatName(e.target.value)}
            />
            <Input
              placeholder="Add Users eg: John, Deepanshu, Jane"
              mb={2}
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </FormControl>
          {/* selected users */}
          <Box display="flex" flexWrap="wrap" w="100%">
            {groupMembers?.map((member) => (
              <UserBadgeItem
                key={member._id}
                user={member}
                handleClose={() => handleDelete(member)}
              />
            ))}
          </Box>
          {/* render searched users */}
          {!loading ? (
            searchResult
              ?.slice(0, 4)
              .map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleClick={() => handleAddUser(user)}
                />
              ))
          ) : (
            <div>loading...</div>
          )}
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="blue" onClick={handleSubmit}>
            Create Chat
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default GroupChatModal;
