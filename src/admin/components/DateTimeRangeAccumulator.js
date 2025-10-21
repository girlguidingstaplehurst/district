import {
  Box,
  Button,
  Flex,
  FormLabel,
  IconButton,
  Input,
  SimpleGrid,
  Stack,
} from "@chakra-ui/react";
import dayjs from "dayjs";
import { TbTrash } from "react-icons/tb";
import { useState } from "react";

function DateTimeRangeAccumulator({ children, value, name, setter }) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const handler = async () => {
    setter([...value, { from: from, to: to }]);

    await setFrom(
      dayjs(from, "YYYY-MM-DD[T]HH:mm")
        .add(7, "days")
        .format("YYYY-MM-DD[T]HH:mm"),
    );
    await setTo(
      dayjs(to, "YYYY-MM-DD[T]HH:mm")
        .add(7, "days")
        .format("YYYY-MM-DD[T]HH:mm"),
    );
  };

  return (
    <Box>
      <SimpleGrid columns={2} gap={4} alignContent="bottom" marginBottom={4}>
        <Box>
          <FormLabel htmlFor="from">From</FormLabel>
          <Input
            flex="1"
            name="from"
            value={from}
            onChange={(event) => setFrom(event.target.value)}
            type="datetime-local"
          />
        </Box>
        <Box>
          <FormLabel htmlFor="to">To</FormLabel>
          <Input
            flex="1"
            name="to"
            value={to}
            onChange={(event) => setTo(event.target.value)}
            type="datetime-local"
          />
        </Box>
      </SimpleGrid>
      <Flex>
        <Button flex={1} onClick={handler}>
          ↓
        </Button>
      </Flex>
      <Stack spacing={2} wrap="wrap">
        <FormLabel>Event Dates</FormLabel>
        {value.map((item, index) => (
          <Box>
            {item.from} - {item.to}{" "}
            <IconButton
              aria-label="Remove date"
              icon={<TbTrash />}
              onClick={() => {
                const values = value.filter((i, idx) => {
                  return index !== idx;
                });
                return setter(values);
              }}
            />
          </Box>
        ))}
      </Stack>
    </Box>
  );
}

export default DateTimeRangeAccumulator;
