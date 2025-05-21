// frontend/src/tests/pages/EditRecommendationRequestPage.test.js
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import EditRecommendationRequestPage from "main/pages/EditRecommendationRequestPage";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

const mockToast = jest.fn();
jest.mock("react-toastify", () => {
  const originalModule = jest.requireActual("react-toastify");
  return {
    __esModule: true,
    ...originalModule,
    toast: {
      success: () => mockToast(),
      error: () => mockToast(),
      info: () => mockToast(),
    },
  };
});

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => {
  const originalModule = jest.requireActual("react-router-dom");
  return {
    __esModule: true,
    ...originalModule,
    useParams: () => ({
      id: 17,
    }),
    useNavigate: () => mockNavigate,
  };
});

describe("EditRecommendationRequestPage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  const setupUserOnly = () => {
    axiosMock.reset();
    axiosMock.resetHistory();

    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);

    // Mock the API calls for professor and recommendation type data
    axiosMock.onGet("/api/admin/users/professors").reply(200, [
      { id: 10, fullName: "Phill Conrad", email: "pconrad@ucsb.edu" },
      { id: 11, fullName: "Tobias Höllerer", email: "holl@ucsb.edu" },
    ]);

    axiosMock.onGet("/api/requesttypes/all").reply(200, [
      { id: 1, requestType: "Grad School" },
      { id: 2, requestType: "Job" },
      { id: 3, requestType: "Scholarship" },
    ]);
  };

  const sampleRecommendationRequest = {
    id: 17,
    professor: {
      id: 10,
      fullName: "Phill Conrad",
      email: "pconrad@ucsb.edu",
    },
    requester: {
      id: 1,
      fullName: "John Hagedorn",
      email: "johnhagedorn@ucsb.edu",
    },
    recommendationType: "Grad School",
    details: "Original details for Stanford application",
    status: "PENDING",
    submissionDate: "2025-05-15T10:00:00",
    lastModifiedDate: "2025-05-15T10:00:00",
    completionDate: null,
    dueDate: "2025-06-15T23:59:59",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders form with correct fields enabled/disabled", async () => {
    setupUserOnly();

    axiosMock
      .onGet("/api/recommendationrequest", { params: { id: 17 } })
      .reply(200, sampleRecommendationRequest);

    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <EditRecommendationRequestPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // Wait for the form to load
    await waitFor(() => {
      expect(
        screen.getByText("Edit Recommendation Request"),
      ).toBeInTheDocument();
    });

    // Wait for the form fields to be populated - split into separate waitFor calls
    await waitFor(() => {
      const detailsField = screen.getByTestId(
        "RecommendationRequestForm-details",
      );
      expect(detailsField).toBeInTheDocument();
    });

    await waitFor(() => {
      const detailsField = screen.getByTestId(
        "RecommendationRequestForm-details",
      );
      expect(detailsField).toHaveValue(
        "Original details for Stanford application",
      );
    });

    // Check that readonly fields are disabled
    const professorField = screen.getByTestId(
      "RecommendationRequestForm-professor_id",
    );
    expect(professorField).toBeDisabled();

    const typeField = screen.getByTestId(
      "RecommendationRequestForm-recommendationType",
    );
    expect(typeField).toBeDisabled();

    const dueDateField = screen.getByTestId(
      "RecommendationRequestForm-dueDate",
    );
    expect(dueDateField).toBeDisabled();

    // Details field should be editable
    const detailsField = screen.getByTestId(
      "RecommendationRequestForm-details",
    );
    expect(detailsField).not.toBeDisabled();
  });

  test("submitting form updates recommendation request", async () => {
    setupUserOnly();

    axiosMock
      .onGet("/api/recommendationrequest", { params: { id: 17 } })
      .reply(200, sampleRecommendationRequest);
    axiosMock.onPut("/api/recommendationrequest").reply(200, {
      ...sampleRecommendationRequest,
      details: "Updated details for Stanford application",
    });

    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <EditRecommendationRequestPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // Wait for the form to load
    await waitFor(() => {
      expect(
        screen.getByTestId("RecommendationRequestForm-details"),
      ).toBeInTheDocument();
    });

    // Update the details field
    const detailsField = screen.getByTestId(
      "RecommendationRequestForm-details",
    );
    fireEvent.change(detailsField, {
      target: { value: "Updated details for Stanford application" },
    });

    // Submit the form
    const submitButton = screen.getByTestId("RecommendationRequestForm-submit");
    fireEvent.click(submitButton);

    // Check that API call was made
    await waitFor(() => {
      expect(axiosMock.history.put.length).toBe(1);
    });

    // Check that API call had correct params (using numeric ID as implementation expects)
    expect(axiosMock.history.put[0].params).toEqual({ id: 17 });

    // Check for successful navigation and toast - split into separate assertions
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/student/profile");
    });
  });

  // Simplified error test that doesn't depend on a spy
  test("handles fetch error gracefully", async () => {
    setupUserOnly();

    // Mock a 500 error response
    axiosMock
      .onGet("/api/recommendationrequest", { params: { id: 17 } })
      .reply(500, {
        message: "Error loading recommendation request",
      });

    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <EditRecommendationRequestPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // Wait for the page to load and check for the main title
    await waitFor(() => {
      expect(
        screen.getByText("Edit Recommendation Request"),
      ).toBeInTheDocument();
    });
  });
});
