export const getSender = (users, loggedUser) => {
  return users && users.filter((user) => user._id !== loggedUser._id)[0];
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
