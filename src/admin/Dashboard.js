import {
  Badge,
  ButtonGroup,
  Checkbox,
  Flex,
  Spacer,
  Stack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { Link as ReactRouterLink, useLoaderData } from "react-router-dom";
import dayjs from "dayjs";
import { AdminFetcher } from "../Fetcher";
import { useState } from "react";
import RoundedButton from "../components/RoundedButton";

export async function populateDashboard() {
  return await AdminFetcher("/api/v1/admin/events", {
    events: [
      {
        id: "aaabbbccc",
        name: "Fake Event Right now",
        from: dayjs().startOf("hour").toDate(),
        to: dayjs().endOf("hour").toDate(),
        status: "provisional",
        contact: "Evan T. Booking",
        email: "evan.t.booking@example.org",
        assignee: "booking@kathielambcentre.org",
      },
      {
        id: "dddeeefff",
        name: "Now that's what I call a Fake Event",
        from: dayjs().startOf("hour").toDate(),
        to: dayjs().endOf("hour").toDate(),
        status: "approved",
        contact: "Evan T. Booking",
        email: "evan.t.booking@example.org",
        assignee: "booking@kathielambcentre.org",
      },
    ],
  });
}

export function Dashboard() {
  const eventsList = useLoaderData();

  const [selectedRows, setSelectedRows] = useState([]);
  const handleRowSelection = (event) => {
    const selectedRow = event.target.value;
    if (event.target.checked) {
      setSelectedRows([...selectedRows, selectedRow]);
    } else {
      setSelectedRows(selectedRows.filter((row) => row !== selectedRow));
    }
  };

  const statusColor = (status) => {
    switch (status) {
      case "provisional":
        return "blue";
      case "awaiting documents":
        return "orange";
      case "approved":
        return "green";
      case "cancelled":
        return "red";
      default:
        return "";
    }
  };

  return (
    <Stack spacing={4} padding={4}>
      <Flex>
        <Text>Filters will (eventually) go here</Text>
        <Spacer />
        <ButtonGroup>
          <RoundedButton
            as={ReactRouterLink}
            to={`/admin/create-invoice?events=${selectedRows}`}
            isDisabled={!selectedRows.length}
          >
            Invoice Selected
          </RoundedButton>
          <RoundedButton as={ReactRouterLink} to={`/admin/create-events`}>
            Create Events
          </RoundedButton>
        </ButtonGroup>
      </Flex>
      <TableContainer>
        <Table variant="striped">
          <Thead>
            <Tr>
              <Th />
              <Th>Name</Th>
              <Th>From</Th>
              <Th>To</Th>
              <Th>Contact</Th>
              <Th>Assignee</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {eventsList.events.map((event) => (
              <Tr>
                <Td>
                  <Checkbox
                    value={event.id}
                    checked={selectedRows.includes(event.id)}
                    onChange={handleRowSelection}
                  />
                </Td>
                <Td>
                  {event.name}{" "}
                  <Badge colorScheme={statusColor(event.status)}>
                    {event.status}
                  </Badge>
                </Td>
                <Td>{dayjs(event.from).format("YYYY-MM-DD HH:mm:ss")}</Td>
                <Td>{dayjs(event.to).format("YYYY-MM-DD HH:mm:ss")}</Td>
                <Td>{event.contact}</Td>
                <Td>{event.assignee}</Td>
                <Td>
                  <RoundedButton
                    as={ReactRouterLink}
                    to={"/admin/review/" + event.id}
                  >
                    Review
                  </RoundedButton>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Stack>
  );
}
