import { CloseIcon } from "@chakra-ui/icons";
import { Box } from "@chakra-ui/react";
import React from "react";

const UserBadgeItem = ({ user, handleClose }) => {
  return (
    <Box
      px={2}
      py={1}
      borderRadius="lg"
      mx={1}
      mb={2}
      fontSize={12}
      bgColor="purple.700"
      color="white"
      display="flex"
      alignItems="center"
      gap={1}
    >
      {user.name}
      <CloseIcon fontSize={10} cursor="pointer" onClick={handleClose} />
    </Box>
  );
};

export default UserBadgeItem;
