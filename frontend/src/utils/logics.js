const currentDate = new Date();

export const getSender = (users, loggedUser) => {
  return users && users.filter((user) => user._id !== loggedUser._id)[0];
};

export const getMessageSenderById = (users, userId, loggedUser) => {
  if (loggedUser._id === userId) return "You";
  return users && users.filter((u) => u._id === userId)[0].name;
};

export const isSameSender = (messages, i, userId) => {
  return (
    i + 1 < messages.length &&
    messages[i].sender._id !== messages[i + 1].sender._id &&
    messages[i + 1].sender._id === userId
  );
};

export const isLastMessage = (messages, i, userId) => {
  return i + 1 === messages.length && messages[i].sender._id !== userId;
};

export const isSameSenderMessage = (messages, i, userId) => {
  return (
    i > 0 &&
    messages[i - 1].sender._id !== messages[i].sender._id &&
    messages[i].sender._id !== userId
  );
};

export const isFirstMessage = (messages, i, userId) => {
  return i === 0 && messages[i].sender._id !== userId;
};

export const isSameSenderMargin = (messages, i, userId) => {
  if (
    i + 1 < messages.length &&
    messages[i].sender._id === messages[i + 1].sender._id &&
    messages[i + 1].sender._id !== userId
  )
    return 36;
  else if (
    i + 1 < messages.length &&
    messages[i].sender._id !== messages[i + 1].sender._id &&
    messages[i + 1].sender._id === userId
  )
    return 0;
};

export const isSameUser = (messages, i) => {
  return (
    i + 1 < messages.length &&
    messages[i].sender._id === messages[i + 1].sender._id
  );
};

export const getMessageTime = (timeStamp) => {
  return new Date(timeStamp).toDateString() === currentDate.toDateString()
    ? new Date(timeStamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    : new Date(timeStamp).toLocaleString([], {
        dateStyle: "short",
        timeStyle: "short",
      });
};
