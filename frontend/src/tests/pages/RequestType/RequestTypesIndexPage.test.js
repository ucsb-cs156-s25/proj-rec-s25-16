import { render, screen } from "@testing-library/react";
import RequestTypesIndexPage from "main/pages/RequestType/RequestTypesIndexPage";

describe("RequestTypesIndexPage", () => {
  test("renders placeholder heading", () => {
    render(<RequestTypesIndexPage />);
    expect(screen.getByTestId("RequestTypesIndexPage")).toHaveTextContent(
      "Request Types Index Page",
    );
  });
});
