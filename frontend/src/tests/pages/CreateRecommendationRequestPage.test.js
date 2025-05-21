// frontend/src/tests/pages/CreateRecommendationRequestPage.test.js
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import CreateRecommendationRequestPage from "main/pages/CreateRecommendationRequestPage";
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
    useNavigate: () => mockNavigate,
  };
});

describe("CreateRecommendationRequestPage tests", () => {
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

    // Mock API calls for dropdown data
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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders form correctly", async () => {
    setupUserOnly();

    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <CreateRecommendationRequestPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // Check page title
    expect(
      screen.getByText("Create Recommendation Request"),
    ).toBeInTheDocument();

    // Fix multiple assertions within waitFor by splitting into multiple waitFor calls
    await waitFor(() => {
      expect(
        screen.getByTestId("RecommendationRequestForm-professor_id"),
      ).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(
        screen.getByTestId("RecommendationRequestForm-recommendationType"),
      ).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(
        screen.getByTestId("RecommendationRequestForm-details"),
      ).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(
        screen.getByTestId("RecommendationRequestForm-dueDate"),
      ).toBeInTheDocument();
    });
  });
});
