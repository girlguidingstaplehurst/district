import {
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Flex,
  Heading,
  IconButton,
  Input,
  Spacer,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import dayjs from "dayjs";
import { useState } from "react";
import duration from "dayjs/plugin/duration";
import customParseFormat from "dayjs/plugin/customParseFormat";
import relativeTime from "dayjs/plugin/relativeTime";
import { TbTrash } from "react-icons/tb";
import { useFormik } from "formik";
import { NumericFormat } from "react-number-format";
import useAuth from "../useAuth";
import RoundedButton from "../../components/RoundedButton";

dayjs.extend(duration);
dayjs.extend(customParseFormat);
dayjs.extend(relativeTime);

const priceFormat = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

function discountForDuration(duration, discountTable) {
  return Object.entries(discountTable).reduce((acc, [h, discount]) => {
    if (duration >= h && discount.value > acc) {
      return -discount.value;
    }
    return acc;
  }, 0);
}

function populateInvoiceItems(events) {
  return events.reduce((acc, event) => {
    const duration = dayjs.duration(dayjs(event.to).diff(event.from)).asHours();

    acc.push({
      eventID: event.id,
      description: `${event.name} - ${duration.toFixed(1)} hours`,
      cost: duration * event.rate,
    });

    const discount = discountForDuration(duration, event.discountTable);
    if (discount < 0) {
      acc.push({
        eventID: event.id,
        description: `${event.name} - Discount`,
        cost: discount,
      });
    }

    acc.push({
      eventID: event.id,
      description: `${event.name} - Refundable Cleaning and Damage deposit`,
      cost: 100, //TODO enable this to be configured
    });

    return acc;
  }, []);
}

export function EditableInvoiceCard({ contact, events }) {
  const [submitting, setSubmitting] = useState(false);
  const { token } = useAuth();

  const formik = useFormik({
    initialValues: {
      contact: contact,
      items: populateInvoiceItems(events),
    }, // validationSchema: EventSchema,
    onSubmit: async (values) => {
      setSubmitting(true);    

      const resp = await fetch("/api/v1/admin/send-invoice", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(values),
      });

      setSubmitting(false);
      return resp;
    },
  });

  const totalCost = formik.values.items.reduce(
    (acc, item) => acc + item.cost,
    0,
  );

  return (
    <form onSubmit={formik.handleSubmit}>
      <Card>
        <CardHeader>
          <Flex>
            <Heading size="m">{contact}</Heading>
            <Spacer />
            <Button
              onClick={() =>
                formik.setFieldValue("items", populateInvoiceItems(events))
              }
            >
              Reset
            </Button>
          </Flex>
        </CardHeader>
        <CardBody>
          <TableContainer variant="simple">
            <Table>
              <Thead>
                <Tr>
                  <Th />
                  <Th>Description</Th>
                  <Th textAlign="right" paddingRight={10}>
                    Price
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {formik.values.items.map((item, index) => (
                  <Tr key={index}>
                    <Td>
                      <IconButton
                        aria-label="Remove"
                        icon={<TbTrash />}
                        onClick={() =>
                          formik.setFieldValue(
                            "items",
                            formik.values.items.filter((_, i) => i !== index),
                          )
                        }
                      />
                    </Td>
                    <Td>
                      <Input
                        name={`items[${index}].description`}
                        value={item.description}
                        onChange={formik.handleChange}
                      />
                    </Td>
                    <Td textAlign="right">
                      <NumericFormat
                        value={item.cost}
                        allowNegative={true}
                        prefix="£"
                        decimalScale={2}
                        fixedDecimalScale={true}
                        thousandSeparator={true}
                        customInput={Input}
                        width="12ch"
                        textAlign="right"
                        onValueChange={({ floatValue }) => {
                          formik.setFieldValue(
                            `items[${index}].cost`,
                            floatValue,
                          );
                        }}
                      />
                    </Td>
                  </Tr>
                ))}
                <Tr>
                  <Td />
                  <Th>Total Cost</Th>
                  <Td textAlign="right" paddingRight={10}>
                    {priceFormat.format(totalCost)}
                  </Td>
                </Tr>
              </Tbody>
            </Table>
          </TableContainer>
        </CardBody>
        <CardFooter minWidth="max-content">
          <Spacer />
          <ButtonGroup flex="0">
            <RoundedButton colorScheme="brand" isLoading={submitting} type="submit">
              Send Invoice
            </RoundedButton>
          </ButtonGroup>
        </CardFooter>
      </Card>
    </form>
  );
}
