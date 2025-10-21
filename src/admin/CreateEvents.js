import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  Container,
  Flex,
  Heading,
  Select,
  Spacer,
  Stack,
  Text,
  Textarea,
  Tooltip,
  useToken,
} from "@chakra-ui/react";
import { Link as ReactRouterLink, useNavigate } from "react-router-dom";
import FormFieldAndLabel from "../components/FormFieldAndLabel";
import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import DateTimeRangeAccumulator from "./components/DateTimeRangeAccumulator";
import { AdminPoster } from "../Poster";
import { RateSelect } from "./components/RateSelect";

const EventSchema = Yup.object().shape({
  eventName: Yup.string()
    .min(2, "too short")
    .max(50, "too long")
    .required("Required"),
  details: Yup.string()
    .min(50, "too short")
    .max(50000, "too long")
    .required("Required"),
  name: Yup.string().required("Required"),
  email: Yup.string().email().required("Required"),
});

export function CreateEvents() {
  const navigate = useNavigate();

  const [submitErrors, setSubmitErrors] = useState("");
  const [eventDates, setEventDates] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [brand500, white] = useToken("colors", ["brand.500", "white"]);

  const BookButton = React.forwardRef(({ children, ...props }, ref) => (
    <Button
      ref={ref}
      colorScheme="green"
      isLoading={submitting}
      isDisabled={!formik.isValid}
      type="submit"
      border={`2px solid ${brand500}`}
      borderRadius={100}
      _hover={{
        bg: white,
        color: brand500,
      }}
      {...props}
    >
      {children}
    </Button>
  ));

  const formik = useFormik({
    initialValues: {
      eventName: "",
      visibility: "show",
      name: "",
      email: "",
      status: "approved",
      rate: "default",
    },
    validationSchema: EventSchema,
    onSubmit: async (values) => {
      setSubmitErrors("");
      setSubmitting(true);

      const resp = await AdminPoster("/api/v1/admin/add-events", {
        event: {
          name: values.eventName,
          details: values.details,
          instances: eventDates,
          publicly_visible: values.visibility === "show",
          status: values.status,
          rate: values.rate,
        },
        contact: {
          name: values.name,
          email_address: values.email,
        },
      });

      setSubmitting(false);

      if (resp !== undefined) {
        if (!resp.ok) {
          const json = await resp.json();
          setSubmitErrors(
            `An error occured when booking (${json.error_message}). Please retry.`,
          );
        } else {
          return navigate("/admin")
        }
      } else {
        setSubmitErrors("Something went wrong - please try again later.")
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <Container maxW="4xl">
        <Stack spacing={4}>
          <Breadcrumb>
            <BreadcrumbItem>
              <BreadcrumbLink as={ReactRouterLink} to="/admin">
                Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink>Create Events</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
          <Heading>Add Events</Heading>

          <FormFieldAndLabel
            label="Event Name"
            name="eventName"
            value={formik.values.eventName}
            errValue={formik.errors.eventName}
            onChange={formik.handleChange}
          />

          <DateTimeRangeAccumulator
            value={eventDates}
            setter={setEventDates}
            name="eventDates"
            label="Event Dates"
          />

          <FormFieldAndLabel
            label="Event Details"
            name="details"
            value={formik.values.details}
            errValue={formik.errors.details}
            onChange={formik.handleChange}
            fieldAs={Textarea}
            fieldProps={{
              rows: 8,
              placeholder:
                "Please provide details of your event, including details of any " +
                "companies or organisations (eg. Caterers, Bouncy Castle hire, " +
                "Entertainers, DJs) that you will be using. This allows us to " +
                "ensure your event will be able to run smoothly at the Centre.",
            }}
          />

          <FormFieldAndLabel
            label="Event Visibility"
            name="visibility"
            value={formik.values.visiblity}
            onChange={formik.handleChange}
            fieldAs={Select}
            fieldProps={{
              children: [
                <option value="show">
                  Show event information on public calendar
                </option>,
                <option value="hide">
                  Hide event information on public calendar
                </option>,
              ],
            }}
          />

          <FormFieldAndLabel
            label="Status"
            name="status"
            value={formik.values.status}
            onChange={formik.handleChange}
            fieldAs={Select}
            fieldProps={{
              children: [
                <option value="approved">Approved</option>,
                <option value="provisional">Provisional</option>,
              ],
            }}
          />

          <Box>
            <Heading size="s">Hiring Rate</Heading>
            <RateSelect
              rateID={formik.values.rate}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </Box>

          <Heading>Contact Info</Heading>
          <FormFieldAndLabel
            label="Name"
            name="name"
            value={formik.values.name}
            errValue={formik.errors.name}
            onChange={formik.handleChange}
          />

          <FormFieldAndLabel
            label="Email"
            name="email"
            value={formik.values.email}
            errValue={formik.errors.email}
            onChange={formik.handleChange}
          />

          <Flex marginBottom={10}>
            <Text color="red">{submitErrors}</Text>
            <Spacer />
            <Tooltip
              label="One or more fields are invalid"
              isDisabled={formik.isValid}
            >
              <BookButton>Submit</BookButton>
            </Tooltip>
          </Flex>
        </Stack>
      </Container>
    </form>
  );
}
