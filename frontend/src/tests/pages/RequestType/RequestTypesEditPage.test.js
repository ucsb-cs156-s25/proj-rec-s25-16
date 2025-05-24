import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import RequestTypesEditPage from "main/pages/RequestType/RequestTypesEditPage";

describe("RequestTypesEditPage", () => {
  test("renders placeholder with ID", () => {
    render(
      <MemoryRouter initialEntries={["/settings/requesttypes/create/123"]}>
        <Routes>
          <Route
            path="/settings/requesttypes/create/:id"
            element={<RequestTypesEditPage />}
          />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByTestId("RequestTypesEditPage")).toHaveTextContent(
      "id=123",
    );
  });
});
