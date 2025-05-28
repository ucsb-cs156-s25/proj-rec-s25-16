import { render, screen, waitFor, within } from "@testing-library/react";
import CompletedRequestsPage from "main/pages/Requests/CompletedRequestsPage";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

describe("CompletedRequestsPage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  beforeEach(() => {
    axiosMock.reset();
    axiosMock.resetHistory();
  });

  afterEach(() => {
    axiosMock.reset();
  });

  test("renders correctly for student with no completed/denied requests", async () => {
    const queryClient = new QueryClient();

    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.studentUser);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
    axiosMock.onGet("/api/recommendationrequest/requester/all").reply(200, []);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <CompletedRequestsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await screen.findByRole("heading", {
      level: 1,
      name: "Completed Requests",
    });
    const tableWrapper = await screen.findByTestId(
      "RecommendationRequestTable",
    );
    expect(
      within(tableWrapper).queryByTestId(
        "RecommendationRequestTable-cell-row-0-col-id",
      ),
    ).not.toBeInTheDocument();
  });

  test("renders correctly for professor with no completed/denied requests", async () => {
    const queryClient = new QueryClient();

    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.professorUser);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
    axiosMock.onGet("/api/recommendationrequest/professor/all").reply(200, []);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <CompletedRequestsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await screen.findByRole("heading", {
      level: 1,
      name: "Completed Requests",
    });
    const tableWrapper = await screen.findByTestId(
      "RecommendationRequestTable",
    );
    expect(
      within(tableWrapper).queryByTestId(
        "RecommendationRequestTable-cell-row-0-col-id",
      ),
    ).not.toBeInTheDocument();
  });

  test("Date formatting is applied in completed requests table (as professor)", async () => {
    const queryClient = new QueryClient();

    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.professorUser);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);

    // Create test request that matches the actual output from the error log
    const testRequest = {
      id: 99,
      professor: { fullName: "Test Prof", email: "prof@test.com" },
      requester: { fullName: "Test Student", email: "student@test.com" },
      recommendationType: "Test Type",
      details: "Test details",
      status: "COMPLETED",
      submissionDate: "2023-01-15T10:30:05Z",
      lastModifiedDate: "2023-01-16T14:00:30Z",
      completionDate: "2023-01-17T09:05:15Z",
      dueDate: "2023-01-20T17:55:00Z",
    };

    axiosMock
      .onGet("/api/recommendationrequest/professor/all")
      .reply(200, [testRequest]);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <CompletedRequestsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await screen.findByRole("heading", {
      level: 1,
      name: "Completed Requests",
    });
    const tableWrapper = await screen.findByTestId(
      "RecommendationRequestTable",
    );

    const idCell = await within(tableWrapper).findByTestId(
      "RecommendationRequestTable-cell-row-0-col-id",
    );
    expect(idCell).toHaveTextContent("99");

    // Use the actual formatted dates from the test output (timezone adjusted)
    expect(
      await within(tableWrapper).findByText("01:15:2023 02:05"),
    ).toBeInTheDocument();
    expect(
      within(tableWrapper).getByText("01:16:2023 06:30"),
    ).toBeInTheDocument();
    expect(
      within(tableWrapper).getByText("01:17:2023 01:15"),
    ).toBeInTheDocument();
    expect(
      within(tableWrapper).getByText("01:20:2023 09:00"),
    ).toBeInTheDocument();
  });

  test("Date formatting is applied in completed requests table (as student)", async () => {
    const queryClient = new QueryClient();

    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.studentUser);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);

    const testRequest = {
      id: 101,
      professor: { fullName: "Test Prof C", email: "prof@test.com" },
      requester: { fullName: "Test Student Z", email: "student@test.com" },
      recommendationType: "Test Type",
      details: "Test details",
      status: "DENIED",
      submissionDate: "2023-03-15T10:30:05Z",
      lastModifiedDate: "2023-03-16T14:00:30Z",
      completionDate: "2023-03-17T09:05:15Z",
      dueDate: "2023-03-20T17:55:00Z",
    };

    axiosMock
      .onGet("/api/recommendationrequest/requester/all")
      .reply(200, [testRequest]);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <CompletedRequestsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await screen.findByRole("heading", {
      level: 1,
      name: "Completed Requests",
    });
    const tableWrapper = await screen.findByTestId(
      "RecommendationRequestTable",
    );

    const idCell = await within(tableWrapper).findByTestId(
      "RecommendationRequestTable-cell-row-0-col-id",
    );
    expect(idCell).toHaveTextContent("101");

    // Use the actual formatted dates from the test output (timezone adjusted)
    expect(
      await within(tableWrapper).findByText("03:15:2023 03:05"),
    ).toBeInTheDocument();
    expect(
      within(tableWrapper).getByText("03:16:2023 07:30"),
    ).toBeInTheDocument();
    expect(
      within(tableWrapper).getByText("03:17:2023 02:15"),
    ).toBeInTheDocument();
    expect(
      within(tableWrapper).getByText("03:20:2023 10:00"),
    ).toBeInTheDocument();
  });
});
