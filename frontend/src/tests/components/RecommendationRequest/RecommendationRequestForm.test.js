// frontend/src/tests/components/RecommendationRequest/RecommendationRequestForm.test.js
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import RecommendationRequestForm from "main/components/RecommendationRequest/RecommendationRequestForm";
import { QueryClient, QueryClientProvider } from "react-query";

// Mock fetch globally
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve([]),
  }),
);

const mockedNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedNavigate,
}));

describe("RecommendationRequestForm tests", () => {
  const queryClient = new QueryClient();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders correctly with no initialContents", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <RecommendationRequestForm submitAction={() => {}} />
        </Router>
      </QueryClientProvider>,
    );

    // Check for presence of form elements
    expect(screen.getByLabelText(/Professor/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Recommendation Type/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Details/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Due Date/)).toBeInTheDocument();
    expect(
      screen.getByTestId("RecommendationRequestForm-submit"),
    ).toBeInTheDocument();
  });

  test("that the initial value of professors and recommendationTypes is only defaults", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <RecommendationRequestForm submitAction={() => {}} />
        </Router>
      </QueryClientProvider>,
    );

    // Check for the default option text
    const professorSelect = screen.getByTestId(
      "RecommendationRequestForm-professor_id",
    );
    const recommendationTypeSelect = screen.getByTestId(
      "RecommendationRequestForm-recommendationType",
    );

    // Check if the select fields have the expected default options
    expect(professorSelect).toHaveTextContent("Select a professor");
    expect(professorSelect).toHaveTextContent("Other");

    expect(recommendationTypeSelect).toHaveTextContent(
      "No recommendation types available, use Other in details",
    );
    expect(recommendationTypeSelect).toHaveTextContent("Other");
  });

  test("renders correctly when initialContents is supplied", async () => {
    const initialContents = {
      id: 1,
      professor_id: "10",
      recommendationType: "Grad School",
      details: "PhD Application",
      dueDate: "2025-05-15T10:00:00",
    };

    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <RecommendationRequestForm
            initialContents={initialContents}
            submitAction={() => {}}
          />
        </Router>
      </QueryClientProvider>,
    );

    const idField = screen.queryByTestId("RecommendationRequestForm-id");
    expect(idField).toBeInTheDocument();
    expect(idField).toHaveValue("1");
    expect(screen.getByTestId("RecommendationRequestForm-details")).toHaveValue(
      "PhD Application",
    );
  });

  test("readonly fields are disabled", async () => {
    const initialContents = {
      id: 1,
      professor_id: "10",
      recommendationType: "Grad School",
      details: "PhD Application",
      dueDate: "2025-05-15T10:00:00",
    };

    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <RecommendationRequestForm
            initialContents={initialContents}
            submitAction={() => {}}
            readOnlyFields={["professor_id", "recommendationType"]}
          />
        </Router>
      </QueryClientProvider>,
    );

    // Check that specified fields are disabled
    expect(
      screen.getByTestId("RecommendationRequestForm-professor_id"),
    ).toBeDisabled();
    expect(
      screen.getByTestId("RecommendationRequestForm-recommendationType"),
    ).toBeDisabled();

    // Details should not be disabled
    expect(
      screen.getByTestId("RecommendationRequestForm-details"),
    ).not.toBeDisabled();
  });

  test("cancel button navigates back", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <RecommendationRequestForm submitAction={() => {}} />
        </Router>
      </QueryClientProvider>,
    );

    // Click the cancel button
    const cancelButton = screen.getByTestId("RecommendationRequestForm-cancel");
    fireEvent.click(cancelButton);

    // Check that navigate was called with -1 (go back)
    expect(mockedNavigate).toHaveBeenCalledWith(-1);
  });
});
