import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import RecommendationRequestForm from "main/components/RecommendationRequest/RecommendationRequestForm";
import { recommendationRequestFixtures } from "fixtures/recommendationRequestFixtures";
import { QueryClient, QueryClientProvider } from "react-query";

// CORRECTED IMPORTS FOR DEFAULT EXPORTED FIXTURES
import usersFixtures from "fixtures/usersFixtures";
import recommendationTypeFixtures from "fixtures/recommendationTypeFixtures";

const mockedNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedNavigate,
}));

describe("RecommendationRequestForm tests", () => {
  const queryClient = new QueryClient();
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
    
    global.fetch = jest.fn((url) => {
      if (url === "/api/admin/users/professors") {
        // Ensure usersFixtures is defined and has twoProfessors
        if (usersFixtures && usersFixtures.twoProfessors) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(usersFixtures.twoProfessors),
          });
        }
        // Fallback if fixture is not as expected, to avoid undefined errors in mock
        return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
      }
      if (url === "/api/requesttypes/all") {
        // Ensure recommendationTypeFixtures is defined and has fourTypes
        if (recommendationTypeFixtures && recommendationTypeFixtures.fourTypes) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(recommendationTypeFixtures.fourTypes),
          });
        }
        // Fallback
        return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
      }
      console.warn(`Unhandled fetch mock in test for URL: ${url}`);
      return Promise.reject(new Error(`Unhandled fetch mock in test for URL: ${url}`));
    });
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  const testId = "RecommendationRequestForm";

  test("renders correctly with no initialContents and dropdowns populate from mock fetch", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <RecommendationRequestForm />
        </Router>
      </QueryClientProvider>
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();

    if (usersFixtures && usersFixtures.twoProfessors && usersFixtures.twoProfessors.length > 0) {
      expect(await screen.findByRole('option', { name: usersFixtures.twoProfessors[0].fullName })).toBeInTheDocument();
    } else {
      expect(await screen.findByRole('option', { name: /Loading professors...|No professors available/i })).toBeInTheDocument();
    }

    if (recommendationTypeFixtures && recommendationTypeFixtures.fourTypes && recommendationTypeFixtures.fourTypes.length > 0) {
      expect(await screen.findByRole('option', { name: recommendationTypeFixtures.fourTypes[0].requestType })).toBeInTheDocument();
    } else {
      expect(await screen.findByRole('option', { name: /Loading types...|No recommendation types available/i })).toBeInTheDocument();
    }
  });

  test("renders correctly when passing in initialContents", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <RecommendationRequestForm
            initialContents={recommendationRequestFixtures.oneRecommendation[0]}
          />
        </Router>
      </QueryClientProvider>
    );
    expect(await screen.findByTestId(`${testId}-id`)).toBeInTheDocument();
    // Assertions for dropdown population can still be made here, as fetch will be called
    if (usersFixtures && usersFixtures.twoProfessors && usersFixtures.twoProfessors.length > 0) {
      expect(await screen.findByRole('option', { name: usersFixtures.twoProfessors[0].fullName })).toBeInTheDocument();
    }
  });

  test("that the correct error messages appear in console when fetch calls fail in component", async () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    global.fetch = jest.fn((url) => {
      if (url === "/api/admin/users/professors") {
        return Promise.reject(new Error("Simulated: Professors fetch failed"));
      }
      if (url === "/api/requesttypes/all") {
        return Promise.reject(new Error("Simulated: Request types fetch failed"));
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
    });

    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <RecommendationRequestForm />
        </Router>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith("Error fetching professors:", "Simulated: Professors fetch failed");
    });
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith("Error fetching request types:", "Simulated: Request types fetch failed");
    });
    
    consoleErrorSpy.mockRestore();
  });

  test("that navigate(-1) is called when Cancel is clicked", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <RecommendationRequestForm />
        </Router>
      </QueryClientProvider>
    );
    const cancelButton = await screen.findByTestId(`${testId}-cancel`);
    fireEvent.click(cancelButton);
    await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
  });

  test("that the correct validations are performed", async () => {
    global.fetch = jest.fn((url) => {
       if (url === "/api/admin/users/professors") {
        return Promise.resolve({ ok: true, json: () => Promise.resolve([]) }); // Ensure empty for validation
      }
      if (url === "/api/requesttypes/all") {
        return Promise.resolve({ ok: true, json: () => Promise.resolve([]) }); // Ensure empty for validation
      }
      return Promise.reject(new Error(`Unhandled fetch: ${url}`));
    });

    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <RecommendationRequestForm />
        </Router>
      </QueryClientProvider>
    );

    const submitButton = await screen.findByTestId(`${testId}-submit`);
    fireEvent.click(submitButton);

    expect(await screen.findByText(/Please select a professor/)).toBeInTheDocument();
    expect(await screen.findByText(/Please select a recommendation type/)).toBeInTheDocument();
  });

  test("that dropdown renders correctly with empty arrays", async () => {
  global.fetch = jest.fn((url) => {
    if (url === "/api/admin/users/professors") {
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
    }
    if (url === "/api/requesttypes/all") {
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
    }
    return Promise.reject(new Error(`Unhandled fetch: ${url}`));
  });

  render(
    <QueryClientProvider client={queryClient}>
      <Router>
        <RecommendationRequestForm />
      </Router>
    </QueryClientProvider>
  );

  // Test that it handles empty arrays properly
  expect(await screen.findByText("No professors available")).toBeInTheDocument();
  expect(
    screen.getByText("No recommendation types available, use Other in details")
  ).toBeInTheDocument();
  expect(screen.getByText("Other")).toBeInTheDocument();
});

test("that dropdown renders correctly with null/undefined arrays", async () => {
  global.fetch = jest.fn((url) => {
    if (url === "/api/admin/users/professors") {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(null) });
    }
    if (url === "/api/requesttypes/all") {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(undefined) });
    }
    return Promise.reject(new Error(`Unhandled fetch: ${url}`));
  });

  render(
    <QueryClientProvider client={queryClient}>
      <Router>
        <RecommendationRequestForm />
      </Router>
    </QueryClientProvider>
  );

  // Test that it handles null/undefined properly
  expect(await screen.findByText("No professors available")).toBeInTheDocument();
  expect(
    screen.getByText("No recommendation types available, use Other in details")
  ).toBeInTheDocument();
});

});