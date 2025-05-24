import { render, screen } from "@testing-library/react";
import RequestTypesCreatePage from "main/pages/RequestType/RequestTypesCreatePage";

describe("RequestTypesCreatePage", () => {
  test("renders placeholder heading", () => {
    render(<RequestTypesCreatePage />);
    expect(screen.getByTestId("RequestTypesCreatePage")).toHaveTextContent(
      "Request Types Create Page",
    );
  });
});
