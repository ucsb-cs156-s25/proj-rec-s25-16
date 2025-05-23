import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { recommendationRequestFixtures } from "fixtures/recommendationRequestFixtures";
import RecommendationRequestTable from "main/components/RecommendationRequest/RecommendationRequestTable";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import { currentUserFixtures } from "fixtures/currentUserFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import { hasRole } from "main/utils/currentUser";

const mockedNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedNavigate,
}));

describe("UserTable tests", () => {
  const queryClient = new QueryClient();

  test("Has the expected column headers and content for ordinary user", () => {
    const currentUser = currentUserFixtures.userOnly;

    expect(hasRole(currentUser, "ROLE_USER")).toBe(true);
    expect(hasRole(currentUser, "ROLE_ADMIN")).toBe(false);

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
    const expectedFields = [
      "id",
      "professor.fullName",
      "professor.email",
      "requester.fullName",
      "requester.email",
      "requestType.requestType",
      "details",
      "status",
      "submissionDate",
      "lastModifiedDate",
      "completionDate",
      "dueDate",
    ];
    const testId = "RecommendationRequestTable";

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    expectedFields.forEach((field) => {
      const header = screen.getByTestId(`${testId}-cell-row-0-col-${field}`);
      expect(header).toBeInTheDocument();
    });

    expect(screen.getByTestId(`${testId}-cell-row-0-col-id`)).toHaveTextContent(
      "2",
    );
    expect(screen.getByTestId(`${testId}-cell-row-1-col-id`)).toHaveTextContent(
      "3",
    );

    const editButton = screen.queryByTestId(
      `${testId}-cell-row-0-col-Edit-button`,
    );
    expect(editButton).toBeInTheDocument();

    expect(editButton).toHaveClass("btn btn-primary");

    const deleteButton = screen.queryByTestId(
      `${testId}-cell-row-0-col-Delete-button`,
    );
    expect(deleteButton).toBeInTheDocument();
  });

  test("Has the expected column headers and content for adminUser", () => {
    const currentUser = currentUserFixtures.adminUser;

    expect(hasRole(currentUser, "ROLE_ADMIN")).toBe(true);
    expect(hasRole(currentUser, "ROLE_USER")).toBe(true);

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
    const expectedFields = [
      "id",
      "professor.fullName",
      "professor.email",
      "requester.fullName",
      "requester.email",
      "requestType.requestType",
      "details",
      "status",
      "submissionDate",
      "lastModifiedDate",
      "completionDate",
      "dueDate",
    ];
    const testId = "RecommendationRequestTable";

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    expectedFields.forEach((field) => {
      const header = screen.getByTestId(`${testId}-cell-row-0-col-${field}`);
      expect(header).toBeInTheDocument();
    });

    expect(screen.getByTestId(`${testId}-cell-row-0-col-id`)).toHaveTextContent(
      "2",
    );
    expect(screen.getByTestId(`${testId}-cell-row-1-col-id`)).toHaveTextContent(
      "3",
    );

    const deleteButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Delete-button`,
    );
    expect(deleteButton).toBeInTheDocument();
    expect(deleteButton).toHaveClass("btn-danger");

    const editButton = screen.queryByTestId(
      `${testId}-cell-row-0-col-Edit-button`,
    );
    expect(editButton).not.toBeInTheDocument();
  });

  test("Edit button navigates to the edit page for user", async () => {
    const currentUser = currentUserFixtures.userOnly;

    expect(hasRole(currentUser, "ROLE_USER")).toBe(true);
    expect(hasRole(currentUser, "ROLE_ADMIN")).toBe(false);

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

    await waitFor(() => {
      expect(
        screen.getByTestId(`RecommendationRequestTable-cell-row-0-col-id`),
      ).toHaveTextContent("2");
    });

    const editButton = screen.getByTestId(
      `RecommendationRequestTable-cell-row-0-col-Edit-button`,
    );
    expect(editButton).toBeInTheDocument();

    fireEvent.click(editButton);

    await waitFor(() =>
      expect(mockedNavigate).toHaveBeenCalledWith("/requests/edit/2"),
    );
  });

  //Added for mutation coverage for the case in which the user is neither a user nor an admin
  test("A user with no roles has expected content", () => {
    const currentUser = currentUserFixtures.notLoggedIn;

    expect(hasRole(currentUser, "ROLE_USER")).toBe(undefined);

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

    const testId = "RecommendationRequestTable";

    const editButton = screen.queryByTestId(
      `${testId}-cell-row-0-col-Edit-button`,
    );
    expect(editButton).not.toBeInTheDocument();

    const deleteButton = screen.queryByTestId(
      `${testId}-cell-row-0-col-Delete-button`,
    );
    expect(deleteButton).not.toBeInTheDocument();
  });

  //for user
  test("Delete button calls delete callback (for user)", async () => {
    // arrange
    const currentUser = currentUserFixtures.userOnly;

    const axiosMock = new AxiosMockAdapter(axios);
    axiosMock
      .onDelete("/api/recommendationrequest")
      .reply(200, { message: "Recommendation Request deleted" });

    // act - render the component
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

    // assert - check that the expected content is rendered

    await waitFor(() => {
      expect(
        screen.getByTestId(`RecommendationRequestTable-cell-row-0-col-id`),
      ).toHaveTextContent("2");
    });

    const deleteButton = screen.getByTestId(
      `RecommendationRequestTable-cell-row-0-col-Delete-button`,
    );
    expect(deleteButton).toBeInTheDocument();

    // act - click the delete button
    fireEvent.click(deleteButton);

    // assert - check that the delete endpoint was called

    await waitFor(() => expect(axiosMock.history.delete.length).toBe(1));
    expect(axiosMock.history.delete[0].params).toEqual({ id: 2 });
  });

  //for admin
  test("Delete button calls delete callback (admin)", async () => {
    // arrange
    const currentUser = currentUserFixtures.adminUser;

    const axiosMock = new AxiosMockAdapter(axios);
    axiosMock
      .onDelete("/api/recommendationrequest")
      .reply(200, { message: "Recommendation Request deleted" });

    // act - render the component
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

    // assert - check that the expected content is rendered

    await waitFor(() => {
      expect(
        screen.getByTestId(`RecommendationRequestTable-cell-row-0-col-id`),
      ).toHaveTextContent("2");
    });

    const deleteButton = screen.getByTestId(
      `RecommendationRequestTable-cell-row-0-col-Delete-button`,
    );
    expect(deleteButton).toBeInTheDocument();

    // act - click the delete button
    fireEvent.click(deleteButton);

    // assert - check that the delete endpoint was called

    await waitFor(() => expect(axiosMock.history.delete.length).toBe(1));
    expect(axiosMock.history.delete[0].params).toEqual({ id: 2 });
  });
});
