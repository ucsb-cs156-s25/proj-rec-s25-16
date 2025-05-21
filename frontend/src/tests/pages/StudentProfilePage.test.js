// frontend/src/tests/pages/StudentProfilePage.test.js
import React from "react";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import StudentProfilePage from "main/pages/StudentProfilePage";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import mockConsole from "jest-mock-console";

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

describe("StudentProfilePage tests", () => {
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
  };

  const setupNoRole = () => {
    axiosMock.reset();
    axiosMock.resetHistory();

    axiosMock.onGet("/api/currentUser").reply(200, {
      ...apiCurrentUserFixtures.userOnly,
      roles: [], // No roles
    });
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  };

  // Sample recommendation request data
  const recommendationRequestFixtures = [
    {
      id: 1,
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
      details: "PhD application for Stanford",
      status: "PENDING",
      submissionDate: "2025-05-15T10:00:00",
      lastModifiedDate: "2025-05-15T10:00:00",
      completionDate: null,
      dueDate: "2025-06-15T23:59:59",
    },
    {
      id: 2,
      professor: {
        id: 11,
        fullName: "Tobias Höllerer",
        email: "holl@ucsb.edu",
      },
      requester: {
        id: 1,
        fullName: "John Hagedorn",
        email: "johnhagedorn@ucsb.edu",
      },
      recommendationType: "Job",
      details: "Software engineer position at Google",
      status: "SUBMITTED",
      submissionDate: "2025-05-10T14:30:00",
      lastModifiedDate: "2025-05-12T09:15:00",
      completionDate: null,
      dueDate: "2025-05-30T23:59:59",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders table with recommendation requests for current user", async () => {
    setupUserOnly();

    axiosMock
      .onGet("/api/recommendationrequest/requester/all")
      .reply(200, recommendationRequestFixtures);

    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <StudentProfilePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // Check that the table is rendered
    await waitFor(() => {
      expect(screen.getByRole("table")).toBeInTheDocument();
    });

    // Check that user's recommendation requests are displayed - one assertion per waitFor
    await waitFor(() => {
      expect(screen.getByText("Phill Conrad")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(
        screen.getByText("PhD application for Stanford"),
      ).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText("Tobias Höllerer")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(
        screen.getByText("Software engineer position at Google"),
      ).toBeInTheDocument();
    });
  });

  test("create new request button navigates to create page", async () => {
    setupUserOnly();

    axiosMock.onGet("/api/recommendationrequest/requester/all").reply(200, []);

    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <StudentProfilePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // Check that create button exists
    await waitFor(() => {
      expect(screen.getByTestId("create-new")).toBeInTheDocument();
    });

    // Click create button
    const createButton = screen.getByTestId("create-new");
    fireEvent.click(createButton);

    // Check navigation
    expect(mockNavigate).toHaveBeenCalledWith(
      "/student/recommendations/create",
    );
  });

  test("edit button navigates to edit page with correct id", async () => {
    setupUserOnly();

    axiosMock
      .onGet("/api/recommendationrequest/requester/all")
      .reply(200, recommendationRequestFixtures);

    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <StudentProfilePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // Wait for table to render
    await waitFor(() => {
      expect(screen.getByRole("table")).toBeInTheDocument();
    });

    // Find edit buttons
    await waitFor(() => {
      const editButtons = screen.getAllByTestId(
        /RecommendationRequestTable-cell-row-\d+-col-Edit-button/,
      );
      expect(editButtons.length).toBeGreaterThan(0);
      return editButtons;
    }).then((editButtons) => {
      // Click first edit button outside of waitFor
      fireEvent.click(editButtons[0]);
    });

    // Check navigation
    expect(mockNavigate).toHaveBeenCalledWith(
      "/student/recommendations/edit/1",
    );
  });

  test("delete button removes recommendation request", async () => {
    setupUserOnly();

    axiosMock
      .onGet("/api/recommendationrequest/requester/all")
      .reply(200, recommendationRequestFixtures);
    axiosMock.onDelete("/api/recommendationrequest").reply(200, {});

    const queryClient = new QueryClient();
    const restoreConsole = mockConsole();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <StudentProfilePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // Wait for table to render
    await waitFor(() => {
      expect(screen.getByRole("table")).toBeInTheDocument();
    });

    // Find delete buttons
    await waitFor(() => {
      const deleteButtons = screen.getAllByTestId(
        /RecommendationRequestTable-cell-row-\d+-col-Delete-button/,
      );
      expect(deleteButtons.length).toBeGreaterThan(0);
      return deleteButtons;
    }).then((deleteButtons) => {
      // Click first delete button outside of waitFor
      fireEvent.click(deleteButtons[0]);
    });

    // Check that delete API was called with correct parameters
    await waitFor(() => {
      expect(axiosMock.history.delete.length).toBe(1);
    });

    expect(axiosMock.history.delete[0].params).toEqual({ id: 1 });

    restoreConsole();
  });

  test("handles error when deleting recommendation request", async () => {
    setupUserOnly();

    axiosMock
      .onGet("/api/recommendationrequest/requester/all")
      .reply(200, recommendationRequestFixtures);
    axiosMock
      .onDelete("/api/recommendationrequest")
      .reply(500, { message: "Error deleting request" });

    const queryClient = new QueryClient();
    const restoreConsole = mockConsole();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <StudentProfilePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // Wait for table to render
    await waitFor(() => {
      expect(screen.getByRole("table")).toBeInTheDocument();
    });

    // Find delete buttons
    await waitFor(() => {
      const deleteButtons = screen.getAllByTestId(
        /RecommendationRequestTable-cell-row-\d+-col-Delete-button/,
      );
      expect(deleteButtons.length).toBeGreaterThan(0);
      return deleteButtons;
    }).then((deleteButtons) => {
      // Click first delete button outside of waitFor
      fireEvent.click(deleteButtons[0]);
    });

    // Check that error is logged to console
    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
    });

    restoreConsole();
  });

  test("handles undefined recommendation requests gracefully", async () => {
    setupUserOnly();

    // API returns undefined instead of an array
    axiosMock
      .onGet("/api/recommendationrequest/requester/all")
      .reply(200, undefined);

    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <StudentProfilePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // Should show a message
    await waitFor(() => {
      expect(
        screen.getByText("No requests data available"),
      ).toBeInTheDocument();
    });
  });

  test("users with no role cannot see edit/delete buttons", async () => {
    setupNoRole();

    axiosMock
      .onGet("/api/recommendationrequest/requester/all")
      .reply(200, recommendationRequestFixtures);

    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <StudentProfilePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // Wait for table to render
    await waitFor(() => {
      expect(screen.getByRole("table")).toBeInTheDocument();
    });

    // Edit and Delete buttons should not be visible
    expect(screen.queryByText("Edit")).not.toBeInTheDocument();
    expect(screen.queryByText("Delete")).not.toBeInTheDocument();
  });

  test("handles loading state during API request", async () => {
    setupUserOnly();

    // Create a promise we can manually resolve later
    let resolveApiCall;
    const apiPromise = new Promise((resolve) => {
      resolveApiCall = resolve;
    });

    // Mock API to delay response
    axiosMock
      .onGet("/api/recommendationrequest/requester/all")
      .reply(() => apiPromise);

    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <StudentProfilePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // Verify table is rendered
    await waitFor(() => {
      expect(screen.getByRole("table")).toBeInTheDocument();
    });

    // This will specifically select the tbody element
    const tableBody = within(screen.getByRole("table")).getAllByRole(
      "rowgroup",
    )[1]; // Select the second rowgroup (tbody)
    expect(within(tableBody).queryAllByRole("row").length).toBe(0);

    // Resolve the API call
    resolveApiCall([200, recommendationRequestFixtures]);

    // Verify data appears
    await waitFor(() => {
      expect(screen.getByText("Phill Conrad")).toBeInTheDocument();
    });
  });
});
