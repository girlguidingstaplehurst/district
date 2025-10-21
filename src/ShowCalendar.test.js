import { render, screen } from "@testing-library/react";
import ShowCalendar from "./ShowCalendar";

test("renders learn react link", () => {
  render(<ShowCalendar />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
