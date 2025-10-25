import React from "react";
import {
  Box,
  IconButton,
  useBreakpoint,
  useBreakpointValue,
  useToken,
} from "@chakra-ui/react"; // Here we have used react-icons package for the icons
// And react-slick as our Carousel Lib
import Slider from "react-slick";
import { TbArrowLeft, TbArrowRight } from "react-icons/tb";
import { useLocation } from "react-router-dom"; // Settings for the slider

// Settings for the slider
const settings = {
  dots: true,
  arrows: false,
  fade: true,
  infinite: true,
  autoplay: true,
  speed: 500,
  autoplaySpeed: 5000,
  slidesToShow: 1,
  slidesToScroll: 1,
};

export default function Carousel({ images }) {
  // As we have used custom buttons, we need a reference variable to
  // change the state
  const [slider, setSlider] = React.useState(null);

  const { pathname } = useLocation();
  const theme = pathname === "/" ? "brand" : pathname.split("-")[1];
  const [brand900, white] = useToken("colors", [`${theme}.900`, "white"]);

  // These are the breakpoints which changes the position of the
  // buttons as the screen size changes
  const top = useBreakpointValue({ base: "90%", md: "50%" });
  const side = useBreakpointValue({ base: "30%", md: "10px" });

  // These are the images used in the slide
  return (
    <Box
      paddingTop={"6px"}
      position={"relative"}
      height={"100%"}
      width={"full"}
      overflow={"hidden"}
    >
      {/* CSS files for react-slick */}
      <link
        rel="stylesheet"
        type="text/css"
        href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick.min.css"
      />
      <link
        rel="stylesheet"
        type="text/css"
        href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick-theme.min.css"
      />
      {/* Left Icon */}
      <IconButton
        aria-label="left-arrow"
        bg={brand900}
        color="white"
        borderRadius="full"
        position="absolute"
        left={side}
        top={top}
        transform={"translate(0%, -50%)"}
        border={`2px solid ${brand900}`}
        _hover={{
          bg: white,
          color: brand900,
        }}
        zIndex={2}
        onClick={() => slider?.slickPrev()}
      >
        <TbArrowLeft />
      </IconButton>
      {/* Right Icon */}
      <IconButton
        aria-label="right-arrow"
        bg={brand900}
        color="white"
        borderRadius="full"
        position="absolute"
        right={side}
        top={top}
        transform={"translate(0%, -50%)"}
        border={`2px solid ${brand900}`}
        _hover={{
          bg: white,
          color: brand900,
        }}
        zIndex={2}
        onClick={() => slider?.slickNext()}
      >
        <TbArrowRight />
      </IconButton>
      {/* Slider */}
      <Slider {...settings} ref={(slider) => setSlider(slider)}>
        {images.map((img, index) => (
          <Box
            key={index}
            height="lg"
            position="relative"
            backgroundPosition="center"
            backgroundRepeat="no-repeat"
            backgroundSize="contain"
            backgroundImage={`url(${img.fields.file.url})`}
          />
        ))}
      </Slider>
    </Box>
  );
}
