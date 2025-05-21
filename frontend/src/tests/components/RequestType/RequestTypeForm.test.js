import { render, screen, fireEvent, act } from "@testing-library/react";
import RequestTypeForm from "main/components/RequestType/RequestTypeForm";

describe("RequestTypeForm", () => {
  test("renders without crashing", () => {
    render(<RequestTypeForm submitAction={() => {}} />);
    expect(screen.getByTestId("RequestTypeForm-requestType")).toBeInTheDocument();
  });

  test("submits correct data", async () => {
    const mockSubmit = jest.fn();
    render(<RequestTypeForm submitAction={mockSubmit} />);

    const input = screen.getByTestId("RequestTypeForm-requestType");
    const submit = screen.getByTestId("RequestTypeForm-submit");

    fireEvent.change(input, { target: { value: "Test Request" } });

    await act(async () => {
      fireEvent.click(submit);
    });

    expect(mockSubmit).toHaveBeenCalledWith(
      { requestType: "Test Request" },
      expect.anything()
    );
  });

  test("shows validation error if empty", async () => {
    render(<RequestTypeForm submitAction={() => {}} />);
    const submit = screen.getByTestId("RequestTypeForm-submit");

    await act(async () => {
      fireEvent.click(submit);
    });

    expect(await screen.findByText("Request type is required")).toBeInTheDocument();
  });
});
