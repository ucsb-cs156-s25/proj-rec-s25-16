import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import PendingRequestsPage from "main/pages/Requests/PendingRequestsPage";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import { recommendationRequestFixtures } from "fixtures/recommendationRequestFixtures";
import mockConsole from "jest-mock-console";

describe("PendingRequestsPage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);
  const queryClient = new QueryClient();

  const setupUserOnly = () => {
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  };

  beforeEach(() => {
    axiosMock.reset();
    axiosMock.resetHistory();
  });

  test("Renders expected content", async () => {
    setupUserOnly();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <PendingRequestsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await screen.findByText("Pending Requests");
  });

  test("Renders pending requests for professor", async () => {
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.professorUser);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
    axiosMock
      .onGet("/api/recommendationrequest/professor/all")
      .reply(200, recommendationRequestFixtures.mixedRequests);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <PendingRequestsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("Pending Requests")).toBeInTheDocument();
    });

    expect(axiosMock.history.get.length).toBe(3);
    expect(
      screen.getByTestId("RecommendationRequestTable"),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getByTestId(`RecommendationRequestTable-cell-row-0-col-status`),
      ).toBeInTheDocument();
    });

    const statusCells = screen.getAllByTestId(
      /RecommendationRequestTable-cell-row-.*-col-status/,
    );
    expect(
      statusCells.some((cell) => cell.textContent === "COMPLETED"),
    ).toBeFalsy();
    expect(
      statusCells.some((cell) => cell.textContent === "DENIED"),
    ).toBeFalsy();
    expect(
      statusCells.some((cell) => cell.textContent === "PENDING"),
    ).toBeTruthy();

    const status = screen.getByTestId(`status-dropdown-${8}`);
    expect(status).toBeInTheDocument();
  });

  test("Renders empty table when no completed requests", async () => {
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
          <PendingRequestsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { level: 1, name: "Pending Requests" }),
      ).toBeInTheDocument();
    });

    expect(axiosMock.history.get.length).toBe(3);
    expect(
      screen.getByTestId("RecommendationRequestTable"),
    ).toBeInTheDocument();
  });

  test("Renders pending requests for student", async () => {
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.studentUser);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
    axiosMock
      .onGet("/api/recommendationrequest/requester/all")
      .reply(200, recommendationRequestFixtures.mixedRequests);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <PendingRequestsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { level: 1, name: "Pending Requests" }),
      ).toBeInTheDocument();
    });

    expect(axiosMock.history.get.length).toBe(3);
    expect(
      screen.getByTestId("RecommendationRequestTable"),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getByTestId(`RecommendationRequestTable-cell-row-0-col-status`),
      ).toBeInTheDocument();
    });

    const statusCells = screen.getAllByTestId(
      /RecommendationRequestTable-cell-row-.*-col-status/,
    );
    expect(
      statusCells.some((cell) => cell.textContent === "COMPLETED"),
    ).toBeFalsy();
    expect(
      statusCells.some((cell) => cell.textContent === "DENIED"),
    ).toBeFalsy();
    expect(
      statusCells.some((cell) => cell.textContent === "PENDING"),
    ).toBeTruthy();

    const status = screen.getByTestId(`status-span-${8}`);
    expect(status).toBeInTheDocument();
  });

  test("Renders empty table when no pending requests for student", async () => {
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
          <PendingRequestsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { level: 1, name: "Pending Requests" }),
      ).toBeInTheDocument();
    });

    expect(axiosMock.history.get.length).toBe(3);
    expect(
      screen.getByTestId("RecommendationRequestTable"),
    ).toBeInTheDocument();
  });

  test("Dropdown menu appears for professor user on pending requests page", async () => {
    const _restoreConsole = mockConsole();
    let currentRequests = [...recommendationRequestFixtures.mixedRequests];

    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.professorUser);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
    axiosMock
      .onGet("/api/recommendationrequest/professor/all")
      .reply(() => [200, currentRequests]);
    axiosMock.onPut("/api/recommendationrequest/professor").reply(() => {
      currentRequests = currentRequests.map((request) =>
        request.id === 8 ? { ...request, status: "COMPLETED" } : request,
      );
      return [
        200,
        {
          ...recommendationRequestFixtures.mixedRequests[2],
          status: "COMPLETED",
        },
      ];
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <PendingRequestsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(axiosMock.history.get.length).toBe(3);
    expect(
      screen.getByTestId("RecommendationRequestTable"),
    ).toBeInTheDocument();

    await waitFor(() => {
      const statusCell = screen.getByTestId(
        `RecommendationRequestTable-cell-row-0-col-status`,
      );
      expect(statusCell).toBeInTheDocument();
    });

    const statusDropdown = screen.getByTestId(`status-dropdown-${8}`);
    expect(statusDropdown).toBeInTheDocument();
    const dropdownToggle = within(statusDropdown).getByRole("button");
    expect(dropdownToggle).toBeInTheDocument();

    fireEvent.click(dropdownToggle);

    await waitFor(() => {
      expect(dropdownToggle).toHaveAttribute("aria-expanded", "true");
    });

    expect(
      screen.getByTestId(`RecommendationRequestTable-cell-row-0-col-status`),
    ).toBeInTheDocument();
    const completed = await screen.findByText("COMPLETED");
    fireEvent.click(completed);

    queryClient.invalidateQueries("/api/recommendationrequest/professor/all");

    await waitFor(() => {
      expect(
        screen.queryByTestId(
          "RecommendationRequestTable-cell-row-0-col-status",
        ),
      ).not.toBeInTheDocument();
    });

    expect(console.log).toHaveBeenCalled();
    const message = console.log.mock.calls[0][0];
    expect(message).toEqual(currentRequests[2]);

    expect(
      screen.queryByTestId(`status-dropdown-${8}`),
    ).not.toBeInTheDocument();
  });

  test("Dropdown menu does not appear for student user on pending requests page", async () => {
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.studentUser);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
    axiosMock
      .onGet("/api/recommendationrequest/requester/all")
      .reply(200, recommendationRequestFixtures.mixedRequests);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <PendingRequestsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(axiosMock.history.get.length).toBe(3);
    expect(
      screen.getByTestId("RecommendationRequestTable"),
    ).toBeInTheDocument();

    await waitFor(() => {
      const statusCell = screen.getByTestId(
        `RecommendationRequestTable-cell-row-0-col-status`,
      );
      expect(statusCell).toBeInTheDocument();
    });

    const status = screen.getByTestId(`status-span-${8}`);
    expect(status).toBeInTheDocument();
  });
});
