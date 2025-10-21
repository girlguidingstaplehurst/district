import { Box, Flex, FormLabel, Input, Spacer, Text } from "@chakra-ui/react";

function FormFieldAndLabel({
  label,
  name,
  value,
  errValue,
  onChange,
  fieldProps,
  fieldAs = Input,
}) {
  const Field = fieldAs;
  return (
    <Box>
      <Flex>
        <FormLabel htmlFor={name}>{label}</FormLabel>
        <Spacer />
        {errValue ? <Text>{errValue}</Text> : null}
      </Flex>
      <Field
        name={name}
        isInvalid={errValue}
        value={value}
        onChange={onChange}
        {...fieldProps}
      />
    </Box>
  );
}

export default FormFieldAndLabel;
