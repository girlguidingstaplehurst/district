import { Container, Stack } from "@chakra-ui/react";
import { Calendar, dayjsLocalizer } from "react-big-calendar";
import dayjs from "dayjs";
import { useLoaderData } from "react-router-dom";
import "react-big-calendar/lib/css/react-big-calendar.css";
import ManagedContent from "./components/ManagedContent";
import { views } from "react-big-calendar/lib/utils/constants";

const localizer = dayjsLocalizer(dayjs);

function WhatsOn() {
  const date = dayjs();

  let eventsList = useLoaderData();
  if (eventsList.events === undefined || eventsList.events === null) {
    eventsList = {
      events: [
        {
          name: "Fake Event Right now",
          from: date.add(10, "hours").toDate(),
          to: date.add(11, "hours").toDate(),
          status: "provisional",
        },
        {
          name: "Approved event",
          from: date.add(35, "hours").toDate(),
          to: date.add(76, "hours").toDate(),
          status: "approved",
        },
      ],
    };
  }

  const events = eventsList.events.map((event) => ({
    title: event.name,
    start: dayjs(event.from).toDate(),
    end: dayjs(event.to).toDate(),
    allDay: false,
    status: event.status,
  }));

  return (
    <Container maxW="4xl" padding={4}>
      <Stack spacing={4}>
        <ManagedContent name="whats-on" showLastUpdated={false} />
        <Calendar
          localizer={localizer}
          defaultView={views.AGENDA}
          toolbar={false}
          events={events}
          date={date}
          showMultiDayTimes={true}
          views={[views.AGENDA]}
          style={{ height: "80vh" }}
        />
      </Stack>
    </Container>
  );
}

export default WhatsOn;
