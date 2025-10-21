import { AdminFetcher } from "../../Fetcher";
import { useFormik } from "formik";
import { Box, ButtonGroup, Flex, Select, Skeleton } from "@chakra-ui/react";
import RoundedButton from "../../components/RoundedButton";
import { useEffect, useState } from "react";
import { AdminPoster } from "../../Poster";

async function setRate(eventID, rateID) {
  const response = await AdminPoster(
    `/api/v1/admin/events/${eventID}/set-rate`,
    { rate: rateID },
  );
  if (response !== undefined) {
    return response.json();
  }
}

export function RateUpdater({ eventID, rateID = "default" }) {
  const [settingRate, setSettingRate] = useState(false);

  const formik = useFormik({
    initialValues: {
      rate: rateID,
    },
    onSubmit: async (values) => {
      setSettingRate(true);
      await setRate(eventID, values.rate);
      setSettingRate(false);
    },
  });

  return (
    <form onChange={formik.handleChange} onSubmit={formik.handleSubmit}>
      <Flex gap={2}>
        <Box flex="1">
          <RateSelect
            rateID={rateID}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
        </Box>
        <ButtonGroup>
          <RoundedButton
            colorScheme="brand"
            isDisabled={!formik.dirty}
            isLoading={settingRate}
            type="submit"
          >
            Update
          </RoundedButton>
        </ButtonGroup>
      </Flex>
    </form>
  );
}

export function RateSelect({ rateID = "default", onChange, onBlur }) {
  const [rates, setRates] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const resp = await AdminFetcher("/api/v1/admin/rates", [
        {
          id: "default",
          description: "External Hire Rate",
          hourlyRate: 25,
        },
        {
          id: "regular-external",
          description: "Regular External Hire Rate",
          hourlyRate: 20,
        },
      ]);

      if (resp.json !== undefined) {
        return await resp.json();
      } else {
        return resp;
      }
    };
    fetchData().then((r) => {
      setRates(r);
      setLoaded(true);
    });
  }, []);

  return (
    <Skeleton isLoaded={loaded}>
      <Select name="rate" onChange={onChange} onBlur={onBlur}>
        {rates.map((item) => (
          <option
            value={item.id}
            key={item.id}
            selected={item.id === rateID}
          >
            {item.description} - £{item.hourlyRate}/hour
          </option>
        ))}
      </Select>
    </Skeleton>
  );
}
