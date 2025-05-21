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

    // type text, then blur so RHF finishes validation
    await userEvent.type(input, "Test Request");
    await userEvent.tab(); // blur input

    await userEvent.click(submit);

    // wait for RHF to trigger submitAction
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

  test("displays the correct button label", () => {
    render(<RequestTypeForm submitAction={() => {}} buttonLabel="Add Type" />);
    const button = screen.getByTestId("RequestTypeForm-submit");
    expect(button).toHaveTextContent("Add Type");
  });
});
