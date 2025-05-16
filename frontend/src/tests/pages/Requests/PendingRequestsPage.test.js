import { render, screen, waitFor } from "@testing-library/react";
import PendingRequestsPage from "main/pages/Requests/PendingRequestsPage";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import { recommendationRequestFixtures } from "fixtures/recommendationRequestFixtures";

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
    // arrange

    setupUserOnly();

    // act
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <PendingRequestsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // assert
    await screen.findByText("Pending Requests");
  });

  test("Renders completed and denied requests for professor", async () => {
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
    ).toBeTruthy();
    expect(
      statusCells.some((cell) => cell.textContent === "DENIED"),
    ).toBeTruthy();
    expect(
      statusCells.some((cell) => cell.textContent === "PENDING"),
    ).toBeTruthy();
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
    ).toBeTruthy();
    expect(
      statusCells.some((cell) => cell.textContent === "DENIED"),
    ).toBeTruthy();
    expect(
      statusCells.some((cell) => cell.textContent === "PENDING"),
    ).toBeTruthy();
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
});
