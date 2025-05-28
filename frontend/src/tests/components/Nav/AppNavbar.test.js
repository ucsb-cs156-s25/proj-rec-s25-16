import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import { currentUserFixtures } from "fixtures/currentUserFixtures";

import AppNavbar from "main/components/Nav/AppNavbar";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";

describe("AppNavbar tests", () => {
  const queryClient = new QueryClient();

  // helper: centralises the “render in router + query-client” boilerplate
  const renderNavbar = (user, sysInfo = systemInfoFixtures.showingBoth) =>
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AppNavbar currentUser={user} systemInfo={sysInfo} />
        </MemoryRouter>
      </QueryClientProvider>,
    );
  test("renders correctly for regular logged in user", async () => {
    const currentUser = currentUserFixtures.userOnly;
    const doLogin = jest.fn();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AppNavbar currentUser={currentUser} doLogin={doLogin} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await screen.findByText("Welcome, pconrad.cis@gmail.com");
  });

  test("renders correctly for admin user", async () => {
    const currentUser = currentUserFixtures.adminUser;
    const doLogin = jest.fn();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AppNavbar currentUser={currentUser} doLogin={doLogin} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await screen.findByText("Welcome, phtcon@ucsb.edu");
    const adminMenu = screen.getByTestId("appnavbar-admin-dropdown");
    expect(adminMenu).toBeInTheDocument();
  });

  test("renders H2Console and Swagger links correctly", async () => {
    const currentUser = currentUserFixtures.adminUser;
    const systemInfo = systemInfoFixtures.showingBoth;

    const doLogin = jest.fn();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AppNavbar
            currentUser={currentUser}
            systemInfo={systemInfo}
            doLogin={doLogin}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await screen.findByText("H2Console");
    const swaggerMenu = screen.getByText("Swagger");
    expect(swaggerMenu).toBeInTheDocument();
  });

  test("renders the AppNavbarLocalhost when on http://localhost:3000", async () => {
    const currentUser = currentUserFixtures.userOnly;
    const systemInfo = systemInfoFixtures.showingBoth;
    const doLogin = jest.fn();

    delete window.location;
    window.location = new URL("http://localhost:3000");

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AppNavbar
            currentUser={currentUser}
            systemInfo={systemInfo}
            doLogin={doLogin}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await screen.findByTestId("AppNavbarLocalhost");
    expect(screen.getByTestId("AppNavbarLocalhost-message1").textContent).toBe(
      "Running on http://localhost:3000/ with no backend.",
    );
    expect(screen.getByTestId("AppNavbarLocalhost-message2").textContent).toBe(
      "You probably want http://localhost:8080 instead.",
    );
  });

  test("renders the AppNavbarLocalhost when on http://127.0.0.1:3000", async () => {
    const currentUser = currentUserFixtures.userOnly;
    const systemInfo = systemInfoFixtures.showingBoth;
    const doLogin = jest.fn();

    delete window.location;
    window.location = new URL("http://127.0.0.1:3000");

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AppNavbar
            currentUser={currentUser}
            systemInfo={systemInfo}
            doLogin={doLogin}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await screen.findByTestId("AppNavbarLocalhost");
  });

  test("does NOT render the AppNavbarLocalhost when on localhost:8080", async () => {
    const currentUser = currentUserFixtures.userOnly;
    const systemInfo = systemInfoFixtures.showingBoth;
    const doLogin = jest.fn();

    delete window.location;
    window.location = new URL("http://localhost:8080");

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AppNavbar
            currentUser={currentUser}
            systemInfo={systemInfo}
            doLogin={doLogin}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await screen.findByTestId("AppNavbar");
    expect(screen.queryByTestId(/AppNavbarLocalhost/i)).toBeNull();
  });

  test("when oauthlogin undefined, default value is used", async () => {
    const currentUser = currentUserFixtures.notLoggedIn;
    const systemInfo = systemInfoFixtures.oauthLoginUndefined;

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AppNavbar currentUser={currentUser} systemInfo={systemInfo} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await screen.findByText("Log In");
    expect(screen.getByText("Log In")).toHaveAttribute(
      "href",
      "/oauth2/authorization/google",
    );
  });

  test("renders the three prof pages correctly for professor users", async () => {
    const currentUser = currentUserFixtures.professorUser;
    const systemInfo = systemInfoFixtures.showingBoth;
    const doLogin = jest.fn();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AppNavbar
            currentUser={currentUser}
            systemInfo={systemInfo}
            doLogin={doLogin}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await screen.findByText("Pending Requests");
    const pendingLink = screen.getByText("Pending Requests");
    expect(pendingLink).toBeInTheDocument();

    await screen.findByText("Completed Requests");
    const completedLink = screen.getByText("Completed Requests");
    expect(completedLink).toBeInTheDocument();

    await screen.findByText("Statistics");
    const statisticsLink = screen.getByText("Statistics");
    expect(statisticsLink).toBeInTheDocument();
  });

  /* Student users should **not** see professor-only pages */
  test("professor-only pages do not show for student users", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AppNavbar currentUser={currentUserFixtures.studentUser} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.queryByText("Pending Requests")).not.toBeInTheDocument();
    expect(screen.queryByText("Completed Requests")).not.toBeInTheDocument();
    expect(screen.queryByText("Statistics")).not.toBeInTheDocument();
  });

  test("the three prof pages do not show for normal users", async () => {
    const currentUser = currentUserFixtures.userOnly;
    const systemInfo = systemInfoFixtures.showingBoth;
    const doLogin = jest.fn();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AppNavbar
            currentUser={currentUser}
            systemInfo={systemInfo}
            doLogin={doLogin}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.queryByText("Pending Requests")).not.toBeInTheDocument();
    expect(screen.queryByText("Completed Requests")).not.toBeInTheDocument();
    expect(screen.queryByText("Statistics")).not.toBeInTheDocument();
  });

  test("the three prof pages do not show when not logged in", async () => {
    const currentUser = null;
    const systemInfo = systemInfoFixtures.showingBoth;
    const doLogin = jest.fn();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AppNavbar
            currentUser={currentUser}
            systemInfo={systemInfo}
            doLogin={doLogin}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.queryByText("Pending Requests")).not.toBeInTheDocument();
    expect(screen.queryByText("Completed Requests")).not.toBeInTheDocument();
    expect(screen.queryByText("Statistics")).not.toBeInTheDocument();
  });

  test("Admin dropdown does NOT render for normal user", () => {
    const normalUser = currentUserFixtures.userOnly;

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AppNavbar currentUser={normalUser} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      screen.queryByTestId("appnavbar-admin-dropdown"),
    ).not.toBeInTheDocument();
  });

  test("Admin dropdown does NOT render when not logged in", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AppNavbar currentUser={null} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      screen.queryByTestId("appnavbar-admin-dropdown"),
    ).not.toBeInTheDocument();
  });

  test("'Users' link is visible only for ROLE_ADMIN", async () => {
    // ---------- render as ADMIN ----------
    const { rerender } = render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AppNavbar currentUser={currentUserFixtures.adminUser} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // open the dropdown (click the "Admin" toggle)
    userEvent.click(screen.getByRole("button", { name: /admin/i }));

    // now “Users” should appear somewhere in the document
    expect(await screen.findByText("Users")).toBeInTheDocument();

    // ---------- render as PROFESSOR ----------
    rerender(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AppNavbar currentUser={currentUserFixtures.professorUser} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // open the dropdown if (and only if) it exists
    const adminToggle = screen.queryByRole("button", { name: /admin/i });
    if (adminToggle) {
      userEvent.click(adminToggle);
    }

    // “Users” should NOT be present for non-admin roles
    expect(screen.queryByText("Users")).not.toBeInTheDocument();
  });
  /* ---------- Settings dropdown visibility (new tests) ---------- */

  describe("Settings dropdown visibility", () => {
    test("renders Settings dropdown and Request Types link for ROLE_ADMIN", async () => {
      renderNavbar(currentUserFixtures.adminUser);

      // grab the toggle and open the dropdown
      // open the dropdown
      userEvent.click(await screen.findByRole("button", { name: /settings/i }));

      // now the menu item is present
      expect(
        await screen.findByTestId("appnavbar-requesttypes"),
      ).toBeInTheDocument();
    });

    test("renders Settings dropdown and Request Types link for ROLE_PROFESSOR", async () => {
      renderNavbar(currentUserFixtures.professorUser);

      // open the dropdown
      userEvent.click(await screen.findByRole("button", { name: /settings/i }));

      expect(
        await screen.findByTestId("appnavbar-requesttypes"),
      ).toBeInTheDocument();
    });

    test("does NOT render Settings dropdown for normal user", () => {
      renderNavbar(currentUserFixtures.userOnly);
      expect(
        screen.queryByTestId("appnavbar-settings-dropdown"),
      ).not.toBeInTheDocument();
    });

    test("does NOT render Settings dropdown when not logged in", () => {
      renderNavbar(null);
      expect(
        screen.queryByTestId("appnavbar-settings-dropdown"),
      ).not.toBeInTheDocument();
    });
  });
});
