// import axios from "axios";
import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ChatContext = createContext();

const ChatProvider = ({ children }) => {
  const [user, setUser] = useState({});
  const [selectedChat, setSelectedChat] = useState({});
  const [chats, setChats] = useState([]);
  const [notification, setNotification] = useState([]);

  const navigate = useNavigate();

  // axios.defaults.headers.common["Authorization"] = `Bearer ${user.token ?? ""}`;

  const fetchUser = () => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    if (!userInfo) {
      navigate("/");
    } else{
      setUser(userInfo);
      navigate("/chats")
    }
  }

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <ChatContext.Provider
      value={{
        user,
        setUser,
        selectedChat,
        setSelectedChat,
        chats,
        setChats,
        notification,
        setNotification,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChatState = () => {
  return useContext(ChatContext);
};

export default ChatProvider;
