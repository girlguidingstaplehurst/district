import {
  Button, Container,
  Flex,
  Heading,
  Link,
  Select,
  SimpleGrid,
  Spacer,
  Stack,
  StackDivider,
  Text,
  Textarea,
  Tooltip,
  useToken
} from "@chakra-ui/react";
import Summary from "./Summary";
import { useFormik } from "formik";
import {
  Link as ReactRouterLink,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import * as Yup from "yup";
import ReactRecaptcha3 from "react-google-recaptcha3";
import FormFieldAndLabel from "./components/FormFieldAndLabel";
import RoundedButton from "./components/RoundedButton";
import { CookieConsent, getCookieConsentValue } from "react-cookie-consent";
import { TbExternalLink } from "react-icons/tb";

function transformDate(dateStr) {
  return dayjs(dateStr).toDate();
}

function AddEvent() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [submitErrors, setSubmitErrors] = useState("");
  const cookieConsentValue = getCookieConsentValue();
  const [cookieConsent, setCookieConsent] = useState(
    cookieConsentValue !== undefined,
  );

  useEffect(() => {
    if (cookieConsent) {
      ReactRecaptcha3.init("6LdCvFwmAAAAAKkKRWe7CuoK_7B3hteuBfx_4mlW");
    }
  }, [cookieConsent]);

  const start = searchParams.has("start")
    ? searchParams.get("start")
    : dayjs().add(14, "days").startOf("hour");
  const end = searchParams.has("end")
    ? searchParams.get("end")
    : dayjs().add(14, "days").add(1, "hour").startOf("hour");

  const EventSchema = Yup.object().shape({
    eventName: Yup.string()
      .min(2, "too short")
      .max(50, "too long")
      .required("Required"),
    details: Yup.string()
      .min(50, "too short")
      .max(50000, "too long")
      .required("Required"),
    eventDate: Yup.date()
      .transform(transformDate)
      .min(
        dayjs().add(14, "days").startOf("day"),
        "must not be less than 14 days in the future",
      )
      .max(
        dayjs().add(2, "years"),
        "must not be more than 2 years in the future",
      )
      .required("Required"),
    eventTimeFrom: Yup.mixed()
      .required("Required")
      .test(
        "must be before start time",
        "from must be before to",
        function (value) {
          const { eventTimeTo } = this.parent;
          return dayjs(value, "HH:mm").isBefore(dayjs(eventTimeTo, "HH:mm"));
        },
      )
      .test(
        "must not be before 0900",
        "from must not be before 09:00",
        function (value) {
          return dayjs(value, "HH:mm").isSameOrAfter(dayjs("09:00", "HH:mm"));
        },
      )
      .test(
        "must not be after 2200",
        "from must not be after 22:00",
        function (value) {
          return dayjs(value, "HH:mm").isSameOrBefore(dayjs("22:00", "HH:mm"));
        },
      ),
    eventTimeTo: Yup.mixed()
      .required("Required")
      .test(
        "must be after start time",
        "to must be after from",
        function (value) {
          const { eventTimeFrom } = this.parent;
          return dayjs(value, "HH:mm").isAfter(dayjs(eventTimeFrom, "HH:mm"));
        },
      )
      .test(
        "must not be before 0900",
        "to must not be before 09:00",
        function (value) {
          return dayjs(value, "HH:mm").isSameOrAfter(dayjs("09:00", "HH:mm"));
        },
      )
      .test(
        "must not be after 2200",
        "to must not be after 22:00",
        function (value) {
          return dayjs(value, "HH:mm").isSameOrBefore(dayjs("22:00", "HH:mm"));
        },
      ),
    name: Yup.string().required("Required"),
    email: Yup.string().email().required("Required"),
    privacyPolicy: Yup.bool().isTrue("Required"),
    termsOfHire: Yup.bool().isTrue("Required"),
    cleaningAndDamage: Yup.bool().isTrue("Required"),
    carParking: Yup.bool().isTrue("Required"),
    adhesives: Yup.bool().isTrue("Required"),
  });

  const formik = useFormik({
    initialValues: {
      eventName: "",
      eventDate: dayjs(start).format("YYYY-MM-DD"),
      eventTimeFrom: dayjs(start).format("HH:mm"),
      eventTimeTo: dayjs(end).format("HH:mm"),
      visibility: "show",
      name: "",
      email: "",
      privacyPolicy: false,
      termsOfHire: false,
      cleaningAndDamage: false,
      carParking: false,
      adhesives: false,
    },
    validationSchema: EventSchema,
    onSubmit: async (values) => {
      setSubmitErrors("");
      setSubmitting(true);

      const captchaToken = await ReactRecaptcha3.getToken();

      const from = dayjs(
        `${values.eventDate} ${values.eventTimeFrom}`,
        "YYYY-MM-DD HH:mm",
      );
      const to = dayjs(
        `${values.eventDate} ${values.eventTimeTo}`,
        "YYYY-MM-DD HH:mm",
      );

      const resp = await fetch("/api/v1/add-event", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          event: {
            name: values.eventName,
            details: values.details,
            from: from.toISOString(),
            to: to.toISOString(),
            publicly_visible: values.visibility === "show",
          },
          contact: {
            name: values.name,
            email_address: values.email,
          },
          captchaToken: captchaToken,
          privacyPolicy: values.privacyPolicy,
          termsOfHire: values.termsOfHire,
          cleaningAndDamage: values.cleaningAndDamage,
          carParking: values.carParking,
          adhesives: values.adhesives,
        }),
      });

      setSubmitting(false);

      if (!resp.ok) {
        const json = await resp.json();
        setSubmitErrors(
          `An error occured when booking (${json.error_message}). Please retry.`,
        );
      } else {
        return navigate("/");
      }
    },
  });

  const [submitting, setSubmitting] = useState(false);
  const [brand500, brand900, white] = useToken("colors", [
    "brand.500",
    "brand.900",
    "white",
  ]);

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

  return (
    <Container maxW="4xl">
      <form onSubmit={formik.handleSubmit}>
        <CookieConsent
          style={{
            background: brand900,
            color: white,
            justifyContent: "center",
          }}
          overlay={true}
          acceptOnOverlayClick={false}
          ButtonComponent={RoundedButton}
          // customButtonProps={{
          //   colorScheme: "green",
          // }}
          disableButtonStyles={true}
          onAccept={() => setCookieConsent(true)}
          enableDeclineButton={true}
          declineButtonText="< Back"
          DeclineButtonComponent={RoundedButton}
          declineButtonStyle={{
            marginRight: "0.5em",
          }}
          customDeclineButtonProps={{
            colorScheme: "brand.900",
          }}
          onDecline={() => navigate(-1)}
          setDeclineCookie={false}
        >
          We use cookies to make our booking form work. If you do not wish us to
          set cookies, contact{" "}
          <Link href="mailto:bookings@kathielambcentre.org">
            bookings@kathielambcentre.org
          </Link>{" "}
          to make a booking.{" "}
          <Link
            as={ReactRouterLink}
            to="/privacy-policy"
            target="_blank"
            rel="noopener noreferrer"
          >
            Privacy Policy <TbExternalLink style={{ display: "inline" }} />
          </Link>
        </CookieConsent>
        <Stack spacing={2}>
          <Heading>Add Event</Heading>
          <FormFieldAndLabel
            label="Event Name"
            name="eventName"
            value={formik.values.eventName}
            errValue={formik.errors.eventName}
            onChange={formik.handleChange}
          />

          <FormFieldAndLabel
            label="Event Date"
            name="eventDate"
            value={formik.values.eventDate}
            errValue={formik.errors.eventDate}
            onChange={formik.handleChange}
            fieldProps={{ type: "date" }}
          />

          <SimpleGrid columns={2} gap={4}>
            <FormFieldAndLabel
              label="From"
              name="eventTimeFrom"
              value={formik.values.eventTimeFrom}
              errValue={formik.errors.eventTimeFrom}
              onChange={formik.handleChange}
              fieldProps={{ type: "time" }}
            />
            <FormFieldAndLabel
              label="To"
              name="eventTimeTo"
              value={formik.values.eventTimeTo}
              errValue={formik.errors.eventTimeTo}
              onChange={formik.handleChange}
              fieldProps={{ type: "time" }}
            />
          </SimpleGrid>

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

          <Summary formik={formik} />
          <Flex>
            <Text color="red">{submitErrors}</Text>
            <Spacer />
            <Tooltip
              label="One or more fields are invalid"
              isDisabled={formik.isValid}
            >
              <BookButton>Book</BookButton>
            </Tooltip>
          </Flex>
          <StackDivider />
        </Stack>
      </form>
    </Container>
  );
}

export default AddEvent;
