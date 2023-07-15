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

const UpdateGroupChatModal = ({ isOpen, onOpen, onClose }) => {
  const [groupChatName, setGroupChatName] = useState("");
  const [newMembers, setNewMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [renameLoading, setRenameLoading] = useState(false);
  const toast = useToast();
  const { user, selectedChat, setRefresh, setSelectedChat } =
    useChatState();

  const config = {
    headers: { Authorization: `Bearer ${user?.token}` },
  };

  const handleLeaveGroup = async () => {
    try {
      const { data } = await axios.put(
        "/api/chat/group-remove",
        { chatId: selectedChat._id, userId: user._id },
        config
      );
      if (data?.success) {
        toast({
          title: "Group left successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
        onClose();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleDelete = async (member) => {
    setNewMembers(newMembers.filter((val) => val._id !== member._id));
  };

  const handleRename = async () => {
    if (!groupChatName) return;
    setRenameLoading(true);
    try {
      const { data } = await axios.put(
        "/api/chat/rename",
        { chatId: selectedChat._id, chatName: groupChatName },
        config
      );
      if (data?.success) {
        setRefresh(prev => !prev);
        onClose();
        toast({
          title: data?.message,
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
      }
    } catch (error) {
      console.log(error);
    } finally {
      setRenameLoading(false);
    }
  };

  const handleSearch = async (query) => {
    setSearch(query);
    if (!query) return;
    setLoading(true);
    try {
      const { data } = await axios.get(`/api/user?search=${search}`, config);
      setSearchResult(data.users);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = (newUser) => {
    if (
      newMembers.includes(newUser) ||
      selectedChat.users.find((u) => u._id === newUser._id)
      ) {
        toast({
          title: "User already added or in the group",
          status: "warning",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
        return;
    } else if (selectedChat.groupAdmin._id !== user._id) {
      toast({
        title: "Only admins can update",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }
    setNewMembers([...newMembers, newUser]);
  };
  
  const handleAddUsersToGroup = async () => {
    try {
      const { data } = await axios.put(
        "/api/chat/group-add",
        {
          chatId: selectedChat._id,
          users: JSON.stringify(newMembers.map((val) => val._id)),
        },
        config
      );
      if (data?.success) {
        setSelectedChat(data.chat);
        onClose();
        setSearch("");
        setNewMembers([]);
        toast({
          title: "Users added to group",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
      }
    } catch (error) {
      console.log(error);
    }
  };
  
  const handleRemoveUser = async (member) => {
    if (user._id !== selectedChat.groupAdmin._id || member._id === user._id) {
      toast({
        title: "Only admins can remove users",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }
    
    try {
      const { data } = await axios.put(
        "/api/chat/group-remove",
        { chatId: selectedChat._id, userId: member._id },
        config
      );
      if (data?.success) {
        setSelectedChat(data.chat);
        toast({
          title: "User removed from group",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
        onClose();
      }
    } catch (error) {
      console.log(error);
    }
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
          {selectedChat?.chatName}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody display="flex" flexDirection="column" alignItems="center">
          <Box display="flex" flexWrap="wrap" w="100%">
            {selectedChat?.users?.map((member) => (
              <UserBadgeItem
                key={member._id}
                user={member}
                handleClose={() => handleRemoveUser(member)}
              />
            ))}
          </Box>
          <FormControl display="flex">
            <Input
              placeholder="Chat Name"
              mb={3}
              value={groupChatName}
              onChange={(e) => setGroupChatName(e.target.value)}
            />
            <Button
              variant="solid"
              colorScheme="teal"
              ml={2}
              isLoading={renameLoading}
              onClick={handleRename}
            >
              Rename
            </Button>
          </FormControl>
          <FormControl>
            <Input
              placeholder="Add Users eg: John, Deepanshu, Jane"
              mb={2}
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </FormControl>
          <Box display="flex" flexWrap="wrap" w="100%">
            {newMembers?.map((member) => (
              <UserBadgeItem
                key={member._id}
                user={member}
                handleClose={() => handleDelete(member)}
              />
            ))}
          </Box>
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
          {newMembers.length ? (
            <Button mr={2} colorScheme="blue" onClick={handleAddUsersToGroup}>
              Add Users
            </Button>
          ) : (
            <></>
          )}
          <Button colorScheme="red" onClick={handleLeaveGroup}>
            Leave Group
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default UpdateGroupChatModal;
