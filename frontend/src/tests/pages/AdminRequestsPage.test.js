import { render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import AdminRequestsPage from "main/pages/AdminRequestsPage";
import { recommendationRequestFixtures } from "fixtures/recommendationRequestFixtures";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import mockConsole from "jest-mock-console";

import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

describe("AdminRequestsPage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  const testId = "RecommendationRequestTable";

  beforeEach(() => {
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  });

  test("renders without crashing on three requests", async () => {
    const queryClient = new QueryClient();
    axiosMock
      .onGet("/api/recommendationrequest/admin/all")
      .reply(200, recommendationRequestFixtures.threeRecommendations);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminRequestsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );
    await screen.findByText("Requests");
  });

  test("renders empty table when backend unavailable", async () => {
    const queryClient = new QueryClient();
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
      expect(axiosMock.history.get.length).toBeGreaterThanOrEqual(1);
    });

    const errorMessage = console.error.mock.calls[0][0];
    expect(errorMessage).toMatch(
      "Error communicating with backend via GET on /api/recommendationrequest/admin/all",
    );
    restoreConsole();

    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-id`),
    ).not.toBeInTheDocument();
  });
});
