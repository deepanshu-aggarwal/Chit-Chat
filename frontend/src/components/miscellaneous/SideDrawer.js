import React, { useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Input,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Text,
  Tooltip,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { BellIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { useChatState } from "../../Context/ChatProvider";
import ProfileModal from "./ProfileModal";
import { useNavigate } from "react-router-dom";
import ChatSkeleton from "../ChatSkeleton";
import UserListItem from "../UserAvatar/UserListItem";
import axios from "axios";
import { getSender } from "../../utils/logics";
// import NotificationBadge, { Effect } from "react-notification-badge";

const SideDrawer = () => {
  const {
    user,
    setUser,
    setSelectedChat,
    setChats,
    chats,
    notification,
    setNotification,
  } = useChatState();
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const config = {
    headers: { Authorization: `Bearer ${user.token ?? ""}` },
  };

  const handleLogout = () => {
    setUser({});
    setSelectedChat({});
    localStorage.removeItem("userInfo");
    navigate("/");
    toast({
      title: "Logout successfully",
      status: "success",
      duration: 3000,
      isClosable: true,
      position: "top",
    });
  };

  const handleSearch = async () => {
    if (!search) {
      toast({
        title: "Search field is empty",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.get(`/api/user?search=${search}`, config);
      if (data.success) setSearchResults(data.users);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const accessChat = async (userId) => {
    try {
      // trying without Content-type: application/json
      const { data } = await axios.post("/api/chat", { userId }, config);
      if (data?.success) {
        setSelectedChat(data?.chat);
        // if (!chats.find((c) => c._id === data.chat._id))
        setChats([...chats, data.chat]);
      }
      onClose();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        bg="white"
        w="100%"
        p="5px 10px"
        borderWidth="5px"
      >
        <Tooltip label="Search Users to Chat" hasArrow placement="bottom-end">
          <Button variant="ghost" onClick={onOpen}>
            <i className="fas fa-search"></i>
            <Text display={{ base: "none", md: "flex" }} px="4">
              Search User
            </Text>
          </Button>
        </Tooltip>
        <Text fontSize="2xl" fontFamily="Work sans">
          Chit-Chat
        </Text>
        <div>
          <Menu>
            <MenuButton p={1}>
              {/* <NotificationBadge
                count={notification.length}
                effect={Effect.SCALE}
              /> */}
              <BellIcon fontSize="2xl" m={1} />
            </MenuButton>
            <MenuList pl={2}>
              {!notification.length
                ? "No new messages"
                : notification.map((noti) => (
                    <MenuItem
                      key={noti._id}
                      onClick={() => {
                        setSelectedChat(noti?.chat);
                        setNotification(
                          notification &&
                            notification.filter((n) => n._id !== noti._id)
                        );
                      }}
                    >
                      {noti?.chat?.isGroupChat
                        ? `Recieved message from ${noti.chat.chatName}`
                        : `${
                            getSender(noti.chat.users, user).name
                          } just messages you`}
                    </MenuItem>
                  ))}
            </MenuList>
          </Menu>
          <Menu>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
              <Avatar
                size="sm"
                cursor="pointer"
                src={user?.pic}
                name={user?.name}
              />
            </MenuButton>
            <MenuList>
              <ProfileModal user={user}>
                <MenuItem>My Profile</MenuItem>
              </ProfileModal>
              <MenuDivider />
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </MenuList>
          </Menu>
        </div>
      </Box>
      <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px">Search Users</DrawerHeader>
          <DrawerBody>
            <Box display="flex" mb={5}>
              <Input
                placeholder="Search by name or email"
                mr={2}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button onClick={handleSearch}>Go</Button>
            </Box>
            {loading ? (
              <ChatSkeleton />
            ) : (
              searchResults?.map((item) => (
                <UserListItem
                  key={item._id}
                  user={item}
                  handleClick={() => accessChat(item._id)}
                />
              ))
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default SideDrawer;
