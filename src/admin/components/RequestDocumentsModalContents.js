import {
  Checkbox,
  Flex,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  ModalHeader,
  Spacer,
  Stack,
  Text,
  useModalContext,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { useFormik } from "formik";
import { AdminPoster } from "../../Poster";
import RoundedButton from "../../components/RoundedButton";
import { useRevalidator } from "react-router-dom";

async function postDocumentsRequest(eventID, documents) {
  const response = await AdminPoster(
    `/api/v1/admin/events/${eventID}/request-documents`,
    documents,
  );
  if (response !== undefined) {
    return response.json();
  }
}

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

function RequestDocumentsModalContents({ eventID }) {
  const [loading, setLoading] = useState(false);
  const { onClose } = useModalContext();
  const revalidator = useRevalidator();

  const formik = useFormik({
    initialValues: {
      publicLiability: true,
      foodSafety: false,
      riskAssessment: false,
      coshhSheets: false,
      dbsCertificate: false,
    },
    onSubmit: async (values) => {
      setLoading(true);
      await postDocumentsRequest(eventID, values);
      setLoading(false);
      revalidator.revalidate();
      onClose();
    },
  });

  return (
    <form onChange={formik.handleChange} onSubmit={formik.handleSubmit}>
      <ModalHeader>Request Documents</ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        <Stack>
          <FormCheckbox
            name="publicLiability"
            isChecked={formik.values.publicLiability}
            onChange={formik.handleChange}
            errorField={formik.errors.publicLiability}
          >
            Public Liability Insurance
          </FormCheckbox>
          <FormCheckbox
            name="foodSafety"
            isChecked={formik.values.foodSafety}
            onChange={formik.handleChange}
            errorField={formik.errors.foodSafety}
          >
            Food Hygiene Certificate
          </FormCheckbox>
          <FormCheckbox
            name="riskAssessment"
            isChecked={formik.values.riskAssessment}
            onChange={formik.handleChange}
            errorField={formik.errors.riskAssessment}
          >
            Risk Assessment
          </FormCheckbox>
          <FormCheckbox
            name="coshhSheets"
            isChecked={formik.values.coshhSheets}
            onChange={formik.handleChange}
            errorField={formik.errors.coshhSheets}
          >
            COSHH Safety Data Sheets
          </FormCheckbox>
          <FormCheckbox
            name="dbsCertificate"
            isChecked={formik.values.dbsCertificate}
            onChange={formik.handleChange}
            errorField={formik.errors.dbsCertificate}
          >
            DBS Certificate
          </FormCheckbox>
        </Stack>
      </ModalBody>
      <ModalFooter>
        <RoundedButton type="submit" isLoading={loading}>
          Send
        </RoundedButton>
      </ModalFooter>
    </form>
  );
}

export default RequestDocumentsModalContents;
