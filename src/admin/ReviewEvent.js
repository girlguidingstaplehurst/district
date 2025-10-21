import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CardHeader,
  Container,
  Flex,
  Heading,
  Spacer,
  Stack,
  StackDivider,
  Text,
} from "@chakra-ui/react";
import { Link as ReactRouterLink, useLoaderData } from "react-router-dom";
import dayjs from "dayjs";
import { AdminFetcher } from "../Fetcher";
import { RateUpdater } from "./components/RateSelect";
import { AdminPoster } from "../Poster";
import TriggerModal from "./components/TriggerModal";
import React from "react";
import RequestDocumentsModalContents from "./components/RequestDocumentsModalContents";
import ActionButton from "./components/ActionButton";

export async function reviewEvent(eventID) {
  return AdminFetcher("/api/v1/admin/events/" + eventID, {
    id: eventID,
    name: "Fake Event Right now",
    details: "Details of the event will eventually be set in this field here",
    from: dayjs().startOf("hour").toDate(),
    to: dayjs().endOf("hour").toDate(),
    status: "provisional",
    visible: true,
    contact: "Evan T Booking",
    email: "evan.t.booking@example.org",
    assignee: "bookings@kathielambcentre.org",
    keyholderIn: "bookings@kathielambcentre.org",
    keyholderOut: "bookings@kathielambcentre.org",
    invoices: [
      {
        reference: "ABCDEF",
        id: "ggghhhiii",
        status: "raised",
        sent: dayjs().toISOString(),
      },
      {
        reference: "BCDEFG",
        id: "jjjkkklll",
        status: "paid",
        sent: dayjs().toISOString(),
        paid: dayjs().toISOString(),
      },
      {
        reference: "CDEFGH",
        id: "mmmnnnooo",
        status: "cancelled",
      },
    ],
    rateID: "default",
  });
}

function getInvoiceColorScheme(status) {
  switch (status) {
    case "raised":
      return "purple";
    case "paid":
      return "green";
    case "cancelled":
      return "red";
    default:
      return "";
  }
}

function EventStateButtons({ eventID, status }) {
  switch (status) {
    case "provisional":
      return (
        <ButtonGroup>
          <TriggerModal buttonText="Request Documents">
            <RequestDocumentsModalContents eventID={eventID} />
          </TriggerModal>
          <ActionButton action={async () => await cancelEvent(eventID)}>
            Cancel Event
          </ActionButton>
          <ActionButton action={async () => await approveEvent(eventID)}>
            Approve Event
          </ActionButton>
        </ButtonGroup>
      );
    case "awaiting documents":
      return (
        <ButtonGroup>
          <ActionButton action={async () => await cancelEvent(eventID)}>
            Cancel Event
          </ActionButton>
          <ActionButton action={async () => await approveEvent(eventID)}>
            Approve Event
          </ActionButton>
        </ButtonGroup>
      );
    case "approved":
      return (
        <ButtonGroup>
          <ActionButton action={async () => await cancelEvent(eventID)}>
            Cancel Event
          </ActionButton>
        </ButtonGroup>
      );
    case "cancelled":
    default:
      return null;
  }
}

async function cancelEvent(eventID) {
  const response = await AdminPoster(
    `/api/v1/admin/events/${eventID}/cancel-event`,
    null,
  );
  if (response !== undefined) {
    return response.json();
  }
}

async function approveEvent(eventID) {
  const response = await AdminPoster(
    `/api/v1/admin/events/${eventID}/approve-event`,
    null,
  );
  if (response !== undefined) {
    return response.json();
  }
}

export function ReviewEvent() {
  const event = useLoaderData();
  const eventDates = `${dayjs(event.from).format("ddd D MMMM YYYY [at] HH:mm")} to ${dayjs(event.to).format("ddd D MMMM YYYY [at] HH:mm")}`;
  const visibility = event.visible ? (
    <Flex>
      <Box>
        <Heading size="s">Event Visibility</Heading>
        <Text>Event details visible publicly</Text>
      </Box>
      <Spacer />
      {/*<RoundedButton colorScheme="brand">Hide Event Details on Public Website</RoundedButton>*/}
    </Flex>
  ) : (
    <Flex>
      <Box>
        <Heading size="s">Event Visibility</Heading>
        <Text>Event details hidden publicly</Text>
      </Box>
      <Spacer />
      {/*<RoundedButton colorScheme="brand">Show Event Details on Public Website</RoundedButton>*/}
    </Flex>
  );

  const hasInvoices = event.invoices !== undefined && event.invoices.length > 0;

  return (
    <Container maxW="4xl">
      <Stack spacing={4}>
        <Breadcrumb>
          <BreadcrumbItem>
            <BreadcrumbLink as={ReactRouterLink} to="/admin">
              Dashboard
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink>Review "{event.name}"</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
        <Card>
          <CardHeader>
            <Heading size="m">{event.name}</Heading>
          </CardHeader>
          <CardBody>
            <Stack divider={<StackDivider />} spacing="4">
              <Flex>
                <Box>
                  <Heading size="s">Assignee</Heading>
                  <Text>{event.assignee}</Text>
                </Box>
                <Spacer />
                {/*<ButtonGroup>*/}
                {/*  <RoundedButton colorScheme="brand">Assign to Me</RoundedButton>*/}
                {/*</ButtonGroup>*/}
              </Flex>
              <Flex>
                <Box>
                  <Heading size="s">Event Dates and Times</Heading>
                  <Text>{eventDates}</Text>
                </Box>
                <Spacer />
                {/*<ButtonGroup>*/}
                {/*  <RoundedButton colorScheme="brand">Update Dates and Times</RoundedButton>*/}
                {/*</ButtonGroup>*/}
              </Flex>
              <Box>
                <Heading size="s">Event Details</Heading>
                <Text>{event.details}</Text>
              </Box>
              <Flex>
                <Box>
                  <Heading size="s">Event Contact</Heading>
                  <Text>
                    {event.contact} [{event.email}]
                  </Text>
                </Box>
                <Spacer />
                {/*<ButtonGroup>*/}
                {/*  <RoundedButton colorScheme="brand">Update Event Contact</RoundedButton>*/}
                {/*</ButtonGroup>*/}
              </Flex>
              {visibility}
              <Box>
                <Heading size="s">Hiring Rate</Heading>
                <RateUpdater eventID={event.id} rateID={event.rateID} />
              </Box>
              <Flex>
                <Box>
                  <Heading size="s">Invoices</Heading>
                  <ButtonGroup flexWrap="wrap" gap={2}>
                    {hasInvoices ? (
                      event.invoices.map((invoice) => (
                        <Button
                          to={`/admin/invoice/${invoice.id}`}
                          as={ReactRouterLink}
                          colorScheme={getInvoiceColorScheme(invoice.status)}
                        >
                          {invoice.reference} - {invoice.status}{" "}
                          {invoice.paid
                            ? `(${dayjs(invoice.paid).format("D MMMM YYYY")})`
                            : invoice.sent
                              ? `(${dayjs(invoice.sent).format("D MMMM YYYY")})`
                              : null}
                        </Button>
                      ))
                    ) : (
                      <Button
                        as={ReactRouterLink}
                        to={`/admin/create-invoice?events=${event.id}`}
                        colorScheme="brand"
                      >
                        Raise Invoice
                      </Button>
                    )}
                  </ButtonGroup>
                </Box>
              </Flex>
              <Flex>
                <Box>
                  <Heading size="s">Event Status</Heading>
                  <Text>{event.status}</Text>
                </Box>
                <Spacer />
                <EventStateButtons eventID={event.id} status={event.status} />
              </Flex>
              <Flex>
                <Box>
                  <Heading size="s">Keyholders</Heading>
                  <Text>In: {event.keyholderIn}</Text>
                  <Text>Out: {event.keyholderOut}</Text>
                </Box>
                <Spacer />
                {/*<ButtonGroup>*/}
                {/*  <RoundedButton colorScheme="brand">Update Keyholders</RoundedButton>*/}
                {/*</ButtonGroup>*/}
              </Flex>
            </Stack>
          </CardBody>
        </Card>
      </Stack>
    </Container>
  );
}
