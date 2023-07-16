import { Skeleton, Stack } from "@chakra-ui/react";
import React from "react";

const ChatSkeleton = () => {
  return (
    <Stack>
      {Array.from({ length: 9 }).map((_, i) => (
        <Skeleton height="45px" />
      ))}
    </Stack>
  );
};

export default ChatSkeleton;
