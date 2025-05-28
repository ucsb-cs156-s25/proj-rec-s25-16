import { render, screen, waitFor, within } from "@testing-library/react";
import AdminRequestsPage from "main/pages/AdminRequestsPage";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import { recommendationRequestFixtures } from "fixtures/recommendationRequestFixtures";
import mockConsole from "jest-mock-console";

describe("AdminRequestsPage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);
  const queryClient = new QueryClient();

  beforeEach(() => {
    axiosMock.reset();
    axiosMock.resetHistory();
    queryClient.clear();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.adminUser);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  });

  afterEach(() => {
    axiosMock.reset();
  });

  test("renders without crashing on three requests", async () => {
    const threeRequestsFixture = recommendationRequestFixtures.threeRecommendations.map(req => ({
        ...req,
        professor: req.professor || { fullName: "Default Prof", email: "prof@example.com" },
        requester: req.requester || { fullName: "Default Req", email: "req@example.com" },
    }));

    axiosMock
      .onGet("/api/recommendationrequest/admin/all")
      .reply(200, threeRequestsFixture);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminRequestsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );
    
    await screen.findByRole("heading", { level: 2, name: "Requests" });
    expect(await screen.findByTestId("RecommendationRequestTable-header-id")).toBeInTheDocument();
    expect(await screen.findByTestId(`RecommendationRequestTable-cell-row-0-col-id`)).toHaveTextContent(threeRequestsFixture[0].id.toString());
  });

  test("renders empty table when backend returns empty list", async () => {
    axiosMock.onGet("/api/recommendationrequest/admin/all").reply(200, []);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminRequestsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await screen.findByRole("heading", { level: 2, name: "Requests" });
    expect(await screen.findByTestId("RecommendationRequestTable-header-id")).toBeInTheDocument();
    expect(screen.queryByTestId("RecommendationRequestTable-cell-row-0-col-id")).not.toBeInTheDocument();
  });

  test("renders error message when backend unavailable", async () => {
    axiosMock.onGet("/api/recommendationrequest/admin/all").timeout();
    const restoreConsole = mockConsole();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminRequestsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(axiosMock.history.get.filter(req => req.url === "/api/recommendationrequest/admin/all").length).toBeGreaterThanOrEqual(1);
    });
    
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("Error communicating with backend via GET on /api/recommendationrequest/admin/all"),
      expect.anything()
    );
    restoreConsole();

    expect(await screen.findByTestId("RecommendationRequestTable-header-id")).toBeInTheDocument();
    expect(screen.queryByTestId("RecommendationRequestTable-cell-row-0-col-id")).not.toBeInTheDocument();
  });

  test("Date formatting is applied in admin requests table", async () => {
    const testRequest = {
      id: 99,
      professor: { fullName: "Test Prof", email: "prof@test.com" },
      requester: { fullName: "Test Student", email: "student@test.com" },
      recommendationType: "Test Type",
      details: "Test details",
      status: "COMPLETED",
      submissionDate: "2023-01-15T10:30:05Z",   // Should format to "01:15:2023 10:05"
      lastModifiedDate: "2023-01-16T14:20:30Z", // Should format to "01:16:2023 14:30"
      completionDate: "2023-01-17T09:05:15Z",   // Should format to "01:17:2023 09:15"
      dueDate: "2023-01-20T17:00:45Z"           // Should format to "01:20:2023 17:45"
    };

    axiosMock
      .onGet("/api/recommendationrequest/admin/all")
      .reply(200, [testRequest]);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminRequestsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await screen.findByRole("heading", { level: 2, name: "Requests" });
    
    const idCell = await screen.findByTestId("RecommendationRequestTable-cell-row-0-col-id");
    expect(idCell).toHaveTextContent("99");

    const tableElement = screen.getByRole("table");

    expect(await within(tableElement).findByText("01:15:2023 02:05")).toBeInTheDocument();
    expect(within(tableElement).getByText("01:16:2023 06:30")).toBeInTheDocument();
    expect(within(tableElement).getByText("01:17:2023 01:15")).toBeInTheDocument();
    expect(within(tableElement).getByText("01:20:2023 09:45")).toBeInTheDocument();
  });
});