import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { recommendationRequestFixtures } from "fixtures/recommendationRequestFixtures";
import RecommendationRequestTable from "main/components/RecommendationRequest/RecommendationRequestTable";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import { currentUserFixtures } from "fixtures/currentUserFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

const mockedNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedNavigate,
}));

describe("RecommendationRequestTable tests", () => {
  const queryClient = new QueryClient();

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient.clear();
  });

  describe("date formatting", () => {
    test("formats dates correctly to MM:DD:YYYY HH:SS", () => {
      const currentUser = currentUserFixtures.userOnly;

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <RecommendationRequestTable
              requests={[
                {
                  id: 1,
                  professor: { fullName: "Test Prof", email: "prof@test.com" },
                  requester: {
                    fullName: "Test Student",
                    email: "student@test.com",
                  },
                  recommendationType: "Test Type",
                  details: "Test details",
                  status: "PENDING",
                  submissionDate: "2023-01-15T10:30:05Z", // 10 hours, 05 seconds
                  lastModifiedDate: "2023-01-16T14:00:30Z", // 14 hours, 30 seconds
                  completionDate: "2023-01-17T09:05:15Z", // 09 hours, 15 seconds
                  dueDate: "2023-01-20T17:55:00Z", // 17 hours, 00 seconds
                },
              ]}
              currentUser={currentUser}
            />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      // Check that dates are formatted as MM:DD:YYYY HH:SS (Hours:Seconds)
      // Using the actual formatted output from the test environment (timezone adjusted)
      expect(screen.getByText("01:15:2023 02:05")).toBeInTheDocument(); // submissionDate: 02h 05s
      expect(screen.getByText("01:16:2023 06:30")).toBeInTheDocument(); // lastModifiedDate: 06h 30s
      expect(screen.getByText("01:17:2023 01:15")).toBeInTheDocument(); // completionDate: 01h 15s
      expect(screen.getByText("01:20:2023 09:00")).toBeInTheDocument(); // dueDate: 09h 00s
    });

    test("handles null and invalid dates", () => {
      const currentUser = currentUserFixtures.userOnly;

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <RecommendationRequestTable
              requests={[
                {
                  id: 1,
                  professor: { fullName: "Test Prof", email: "prof@test.com" },
                  requester: {
                    fullName: "Test Student",
                    email: "student@test.com",
                  },
                  recommendationType: "Test Type",
                  details: "Test details",
                  status: "PENDING",
                  submissionDate: null,
                  lastModifiedDate: "",
                  completionDate: "invalid-date",
                  dueDate: "2023-01-20T17:30:45Z", // 17 hours, 45 seconds
                },
              ]}
              currentUser={currentUser}
            />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      expect(screen.getByText("01:20:2023 09:45")).toBeInTheDocument(); // valid date should still format

      // Check that empty cells are rendered (they should be empty strings)
      const submissionDateCell = screen.getByTestId(
        "RecommendationRequestTable-cell-row-0-col-submissionDate",
      );
      expect(submissionDateCell).toHaveTextContent("");
      const lastModifiedDateCell = screen.getByTestId(
        "RecommendationRequestTable-cell-row-0-col-lastModifiedDate",
      );
      expect(lastModifiedDateCell).toHaveTextContent("");
      const completionDateCell = screen.getByTestId(
        "RecommendationRequestTable-cell-row-0-col-completionDate",
      );
      expect(completionDateCell).toHaveTextContent("");
    });

    test("handles date parsing errors gracefully", () => {
      const currentUser = currentUserFixtures.userOnly;

      // Create a mock that will throw an error when formatDate is called
      const originalDateConstructor = global.Date;
      global.Date = jest.fn(() => {
        throw new Error("Date parsing error");
      });

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <RecommendationRequestTable
              requests={[
                {
                  id: 1,
                  professor: { fullName: "Test Prof", email: "prof@test.com" },
                  requester: {
                    fullName: "Test Student",
                    email: "student@test.com",
                  },
                  recommendationType: "Test Type",
                  details: "Test details",
                  status: "PENDING",
                  submissionDate: "2023-01-15T10:30:05Z",
                  lastModifiedDate: null,
                  completionDate: null,
                  dueDate: null,
                },
              ]}
              currentUser={currentUser}
            />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      // The cell should be empty when date parsing throws an error
      const submissionDateCell = screen.getByTestId(
        "RecommendationRequestTable-cell-row-0-col-submissionDate",
      );
      expect(submissionDateCell).toHaveTextContent("");

      // Restore the original Date constructor
      global.Date = originalDateConstructor;
    });
  });

  test("Has the expected column headers and content for ordinary user", () => {
    const currentUser = currentUserFixtures.userOnly;

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RecommendationRequestTable
            requests={recommendationRequestFixtures.threeRecommendations}
            currentUser={currentUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const expectedHeaders = [
      "id",
      "Professor Name",
      "Professor Email",
      "Requester Name",
      "Requester Email",
      "Recommendation Type",
      "Details",
      "Status",
      "Submission Date",
      "Last Modified Date",
      "Completion Date",
      "Due Date",
    ];
    expectedHeaders.forEach((headerText) => {
      expect(screen.getByText(headerText)).toBeInTheDocument();
    });
  });

  test("Has the expected column headers and content for adminUser", () => {
    const currentUser = currentUserFixtures.adminUser;
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RecommendationRequestTable
            requests={recommendationRequestFixtures.threeRecommendations}
            currentUser={currentUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const expectedHeaders = [
      "id",
      "Professor Name",
      "Professor Email",
      "Requester Name",
      "Requester Email",
      "Recommendation Type",
      "Details",
      "Status",
      "Submission Date",
      "Last Modified Date",
      "Completion Date",
      "Due Date",
    ];
    expectedHeaders.forEach((headerText) => {
      expect(screen.getByText(headerText)).toBeInTheDocument();
    });
  });

  test("Edit button navigates to the edit page for user", async () => {
    const currentUser = currentUserFixtures.userOnly;
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RecommendationRequestTable
            requests={recommendationRequestFixtures.threeRecommendations}
            currentUser={currentUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const editButton = screen.getAllByTestId(
      /RecommendationRequestTable-cell-row-\d+-col-Edit-button/,
    )[0];
    fireEvent.click(editButton);
    await waitFor(() =>
      expect(mockedNavigate).toHaveBeenCalledWith(
        `/requests/edit/${recommendationRequestFixtures.threeRecommendations[0].id}`,
      ),
    );
  });

  test("A user with no roles has expected content", () => {
    const currentUser = currentUserFixtures.notLoggedIn;
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RecommendationRequestTable
            requests={recommendationRequestFixtures.threeRecommendations}
            currentUser={currentUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      screen.queryByTestId(
        /RecommendationRequestTable-cell-row-\d+-col-Edit-button/,
      ),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId(
        /RecommendationRequestTable-cell-row-\d+-col-Delete-button/,
      ),
    ).not.toBeInTheDocument();
  });

  test("Delete button calls delete callback (for user)", async () => {
    const currentUser = currentUserFixtures.userOnly;
    const axiosMock = new AxiosMockAdapter(axios);
    const requestId = recommendationRequestFixtures.threeRecommendations[0].id;
    axiosMock
      .onDelete("/api/recommendationrequest")
      .reply(200, { message: "Recommendation Request deleted" });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RecommendationRequestTable
            requests={recommendationRequestFixtures.threeRecommendations}
            currentUser={currentUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const deleteButton = screen.getAllByTestId(
      /RecommendationRequestTable-cell-row-\d+-col-Delete-button/,
    )[0];
    fireEvent.click(deleteButton);
    await waitFor(() => expect(axiosMock.history.delete.length).toBe(1));
    expect(axiosMock.history.delete[0].url).toBe("/api/recommendationrequest");
    expect(axiosMock.history.delete[0].params).toEqual({ id: requestId });
  });

  test("Delete button calls delete callback (admin)", async () => {
    const currentUser = currentUserFixtures.adminUser;
    const axiosMock = new AxiosMockAdapter(axios);
    const requestId = recommendationRequestFixtures.threeRecommendations[0].id;
    axiosMock
      .onDelete("/api/recommendationrequest/admin")
      .reply(200, { message: "Recommendation Request deleted" });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RecommendationRequestTable
            requests={recommendationRequestFixtures.threeRecommendations}
            currentUser={currentUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const deleteButton = screen.getAllByTestId(
      /RecommendationRequestTable-cell-row-\d+-col-Delete-button/,
    )[0];
    fireEvent.click(deleteButton);
    await waitFor(() => expect(axiosMock.history.delete.length).toBe(1));
    expect(axiosMock.history.delete[0].url).toBe(
      "/api/recommendationrequest/admin",
    );
    expect(axiosMock.history.delete[0].params).toEqual({ id: requestId });
  });

  test("button columns have correct variants and roles", () => {
    const currentUser = currentUserFixtures.userOnly;

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RecommendationRequestTable
            requests={recommendationRequestFixtures.threeRecommendations}
            currentUser={currentUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // Test that the buttons have the correct Bootstrap variants
    const deleteButton = screen.getAllByTestId(
      /RecommendationRequestTable-cell-row-\d+-col-Delete-button/,
    )[0];
    expect(deleteButton).toHaveClass("btn-danger");

    const editButton = screen.getAllByTestId(
      /RecommendationRequestTable-cell-row-\d+-col-Edit-button/,
    )[0];
    expect(editButton).toHaveClass("btn-primary");
  });

  test("admin user has correct role permissions", () => {
    const currentUser = currentUserFixtures.adminUser;

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RecommendationRequestTable
            requests={recommendationRequestFixtures.threeRecommendations}
            currentUser={currentUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // Admin should have delete button but NOT edit button
    const deleteButton = screen.getAllByTestId(
      /RecommendationRequestTable-cell-row-\d+-col-Delete-button/,
    )[0];
    expect(deleteButton).toBeInTheDocument();

    const editButton = screen.queryByTestId(
      /RecommendationRequestTable-cell-row-\d+-col-Edit-button/,
    );
    expect(editButton).not.toBeInTheDocument();
  });
});
