import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RequestTypeForm from "main/components/RequestType/RequestTypeForm";

describe("RequestTypeForm", () => {
  test("renders without crashing", () => {
    render(<RequestTypeForm submitAction={() => {}} />);
    expect(
      screen.getByTestId("RequestTypeForm-requestType"),
    ).toBeInTheDocument();
  });

  test("submits correct data", async () => {
    const mockSubmit = jest.fn();
    render(<RequestTypeForm submitAction={mockSubmit} />);

    const input = screen.getByTestId("RequestTypeForm-requestType");
    const submit = screen.getByTestId("RequestTypeForm-submit");

    await userEvent.type(input, "Test Request");
    await userEvent.tab(); // blur to trigger RHF validation
    await userEvent.click(submit);

    await waitFor(() =>
      expect(mockSubmit).toHaveBeenCalledWith(
        { requestType: "Test Request" },
        expect.anything(),
      ),
    );
  });

  test("shows validation error if empty", async () => {
    render(<RequestTypeForm submitAction={() => {}} />);
    const submit = screen.getByTestId("RequestTypeForm-submit");

    await userEvent.click(submit);

    expect(
      await screen.findByText("Request type is required"),
    ).toBeInTheDocument();
  });

  test("populates form with initialContents", () => {
    const initialContents = { requestType: "Initial Type" };
    render(
      <RequestTypeForm
        submitAction={() => {}}
        initialContents={initialContents}
      />,
    );

    const input = screen.getByTestId("RequestTypeForm-requestType");
    expect(input).toHaveValue("Initial Type");
  });

  test("displays a custom button label when provided", () => {
    render(<RequestTypeForm submitAction={() => {}} buttonLabel="Add Type" />);
    const button = screen.getByTestId("RequestTypeForm-submit");
    expect(button).toHaveTextContent("Add Type");
  });

  test("uses the default button label when none provided", () => {
    render(<RequestTypeForm submitAction={() => {}} />);
    const button = screen.getByTestId("RequestTypeForm-submit");
    expect(button).toHaveTextContent("Create"); // default label
  });
});
