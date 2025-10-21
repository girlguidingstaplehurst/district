import ManagedContent from "./components/ManagedContent";
import { Container, Skeleton, useBreakpointValue } from "@chakra-ui/react";
import { useState } from "react";

function Location() {
  const mapSize = useBreakpointValue(
    {
      base: "410px",
      md: "820px",
    }
  )

  const [loaded, setLoaded] = useState(false);

  return (
    <Container maxW="5xl">
      <div className="map-padding">&nbsp;</div>
      <Skeleton isLoaded={loaded}>
        <iframe
          title="map"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2501.8941758779506!2d0.5620187903110484!3d51.16574034044232!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x5dc403a4e8cc11d5!2sKathie%20Lamb%20Centre!5e0!3m2!1sen!2suk!4v1677923457941!5m2!1sen!2suk"
          style={{ border: 0 }}
          allowFullScreen="true"
          loading="lazy"
          onLoad={() => setLoaded(true)}
          referrerPolicy="no-referrer-when-downgrade"
          width="100%"
          height={mapSize}
        ></iframe>
      </Skeleton>
      <ManagedContent name="how-to-find-us" showLastUpdated={false} />
    </Container>
  );
}

export default Location;
