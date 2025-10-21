import {
  Card,
  CardBody,
  Checkbox,
  Flex,
  Heading,
  Link,
  Spacer,
  Stack,
  Table,
  TableCaption,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import customParseFormat from "dayjs/plugin/customParseFormat";
import relativeTime from "dayjs/plugin/relativeTime";
import { Link as ReactRouterLink } from "react-router-dom";
import { TbExternalLink } from "react-icons/tb";

dayjs.extend(duration);
dayjs.extend(customParseFormat);
dayjs.extend(relativeTime);

const priceFormat = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

function FormCheckbox({ name, isChecked, onChange, errorField, children }) {
  return (
    <Flex>
      <Checkbox
        name={name}
        isChecked={isChecked}
        onChange={onChange}
        isInvalid={errorField}
      >
        {children}
      </Checkbox>
      <Spacer />
      {errorField ? <Text color="red">{errorField}</Text> : null}
    </Flex>
  );
}

function Summary({ formik }) {
  const from = dayjs(formik.values.eventTimeFrom, ["HH:mm"]);
  const to = dayjs(formik.values.eventTimeTo, ["HH:mm"]);

  let duration = dayjs.duration(0, "h");
  if (from.isValid() && to.isValid()) {
    duration = dayjs.duration(to.diff(from));
  }

  let price = 0;
  if (duration.asHours() !== 0) {
    price = duration.asHours() * 25;
  }
  let discount = 0;
  if (duration.asHours() >= 5) {
    discount = 25;
  }

  return (
    <>
      <Heading>Summary</Heading>
      <Card>
        <CardBody>
          <TableContainer variant="simple">
            <Table>
              <TableCaption placement="top">
                <Heading>Hire Cost</Heading>
              </TableCaption>
              <Thead>
                <Tr>
                  <Th>Description</Th>
                  <Th>Price</Th>
                </Tr>
              </Thead>
              <Tbody>
                {duration.asHours() !== 0 ? (
                  <Tr>
                    <Td>Exclusive hire for {duration.asHours()} hours</Td>
                    <Td>{priceFormat.format(price)}</Td>
                  </Tr>
                ) : null}
                {discount !== 0 ? (
                  <Tr>
                    <Td>Fifth Hour Free!</Td>
                    <Td>{priceFormat.format(-discount)}</Td>
                  </Tr>
                ) : null}
                <Tr>
                  <Td>Refundable Cleaning and Damage deposit</Td>
                  <Td>{priceFormat.format(100)}</Td>
                </Tr>
                <Tr>
                  <Th>Total Cost</Th>
                  <Td>{priceFormat.format(price + 100 - discount)}</Td>
                </Tr>
              </Tbody>
            </Table>
          </TableContainer>
        </CardBody>
      </Card>
      <Stack gap={4}>
        <FormCheckbox
          name="privacyPolicy"
          isChecked={formik.values.privacyPolicy}
          onChange={formik.handleChange}
          errorField={formik.errors.privacyPolicy}
        >
          I have read the{" "}
          <Link
            as={ReactRouterLink}
            to="/privacy-policy"
            target="_blank"
            rel="noopener noreferrer"
          >
            Privacy Policy{" "}
            <TbExternalLink style={{ display: "inline-block" }} />
          </Link>{" "}
          and agree to my data being processed in accordance with it.
        </FormCheckbox>
        <FormCheckbox
          name="cleaningAndDamage"
          isChecked={formik.values.cleaningAndDamage}
          onChange={formik.handleChange}
          errorField={formik.errors.cleaningAndDamage}
        >
          I have read the{" "}
          <Link
            as={ReactRouterLink}
            to="/cleaning-and-damage-policy"
            target="_blank"
            rel="noopener noreferrer"
          >
            Cleaning and Damage Policy{" "}
            <TbExternalLink style={{ display: "inline-block" }} />
          </Link>
          and understand that the deposit may be retained in the event of a
          breach.
        </FormCheckbox>
        <FormCheckbox
          name="termsOfHire"
          isChecked={formik.values.termsOfHire}
          onChange={formik.handleChange}
          errorField={formik.errors.termsOfHire}
        >
          I have read the{" "}
          <Link
            as={ReactRouterLink}
            to="/terms-of-hire"
            target="_blank"
            rel="noopener noreferrer"
          >
            Terms of Hire <TbExternalLink style={{ display: "inline-block" }} />
          </Link>
          and agree that my use of the hall is subject to them.
        </FormCheckbox>
        <FormCheckbox
          name="carParking"
          isChecked={formik.values.carParking}
          onChange={formik.handleChange}
          errorField={formik.errors.carParking}
        >
          I understand that this booking only includes the building itself, and
          does not guarantee availability of car parking or green spaces as
          these are managed by Staplehurst Parish Council.
        </FormCheckbox>
        <FormCheckbox
          name="adhesives"
          isChecked={formik.values.adhesives}
          onChange={formik.handleChange}
          errorField={formik.errors.adhesives}
        >
          I understand that no adhesives (such as sticky tape, blu tack or glue
          dots) are to be used on the walls, doors or floors.
        </FormCheckbox>
      </Stack>
    </>
  );
}

export default Summary;
