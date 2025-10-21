import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
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
import {
  Link as ReactRouterLink,
  useLoaderData,
  useRevalidator,
} from "react-router-dom";
import dayjs from "dayjs";
import { AdminFetcher } from "../Fetcher";
import { AdminPoster } from "../Poster";
import { useState } from "react";
import RoundedButton from "../components/RoundedButton";

export async function manageInvoice(invoiceID) {
  return AdminFetcher("/api/v1/admin/invoices/by-id/" + invoiceID, {
    id: invoiceID,
    reference: "ABCDEF",
    sent: dayjs().startOf("hour").toDate(),
    paid: dayjs().endOf("hour").toDate(),
    status: "raised",
    contact: "evan.t.booking@example.org",
  });
}

async function markPaid(invoiceID) {
  const response = await AdminPoster(
    `/api/v1/admin/invoices/by-id/${invoiceID}/mark-as-paid`,
    null,
  );
  if (response !== undefined) {
    return response.json();
  }
}

export function ManageInvoice() {
  const invoice = useLoaderData();
  const revalidator = useRevalidator();
  const [markingAsPaid, setMarkingAsPaid] = useState(false);

  const isPaid = invoice.status === "paid";

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
            <BreadcrumbLink>Invoice "{invoice.reference}"</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
        <Card>
          <CardHeader>
            <Heading size="m">Invoice {invoice.reference}</Heading>
          </CardHeader>
          <CardBody>
            <Stack divider={<StackDivider />} spacing="4">
              <Flex>
                <Box>
                  <Heading size="s">Contact</Heading>
                  <Text>{invoice.contact}</Text>
                </Box>
              </Flex>
              <Flex>
                <Box>
                  <Heading size="s">Sent</Heading>
                  <Text>{dayjs(invoice.sent).toString()}</Text>
                </Box>
                <Spacer />
                {/*<ButtonGroup>*/}
                {/*  <RoundedButton colorScheme="brand">Resend</RoundedButton>*/}
                {/*</ButtonGroup>*/}
              </Flex>
              <Flex>
                <Box>
                  <Heading size="s">Paid</Heading>
                  <Text>
                    {isPaid ? dayjs(invoice.paid).toString() : "unpaid"}
                  </Text>
                </Box>
                <Spacer />
                {isPaid ? null : (
                  <ButtonGroup>
                    <RoundedButton
                      isLoading={markingAsPaid}
                      onClick={async () => {
                        setMarkingAsPaid(true);
                        await markPaid(invoice.id);
                        revalidator.revalidate();
                        setMarkingAsPaid(false);
                      }}
                    >
                      Mark Paid
                    </RoundedButton>
                  </ButtonGroup>
                )}
              </Flex>
            </Stack>
          </CardBody>
        </Card>
      </Stack>
    </Container>
  );
}
