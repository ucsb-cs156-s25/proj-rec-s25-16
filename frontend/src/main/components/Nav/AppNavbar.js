// frontend/src/main/components/Nav/AppNavbar.js
import { Button, Container, Nav, Navbar, NavDropdown } from "react-bootstrap";
import { Link } from "react-router-dom";
import { hasRole } from "main/utils/currentUser";
import AppNavbarLocalhost from "main/components/Nav/AppNavbarLocalhost";

export default function AppNavbar({
  currentUser,
  systemInfo,
  doLogout,
  currentUrl = window.location.href,
}) {
  const oauthLogin = systemInfo?.oauthLogin || "/oauth2/authorization/google";
  const isAdmin = hasRole(currentUser, "ROLE_ADMIN");
  const isProfessor = hasRole(currentUser, "ROLE_PROFESSOR");
  const isLoggedIn = currentUser && currentUser.loggedIn;

  return (
    <>
      {/* Show dev-only banner if running on localhost */}
      {(currentUrl.startsWith("http://localhost:3000") ||
        currentUrl.startsWith("http://127.0.0.1:3000")) && (
        <AppNavbarLocalhost url={currentUrl} />
      )}

      <Navbar
        expand="xl"
        variant="dark"
        bg="dark"
        sticky="top"
        data-testid="AppNavbar"
      >
        <Container>
          {/* ---- Brand ---- */}
          <Navbar.Brand as={Link} to="/">
            Rec Manager
          </Navbar.Brand>
          <Navbar.Toggle />

          {/* ---- Left-aligned util links ---- */}
          <Nav className="me-auto">
            {systemInfo?.springH2ConsoleEnabled && (
              <Nav.Link href="/h2-console">H2Console</Nav.Link>
            )}
            {systemInfo?.showSwaggerUILink && (
              <Nav.Link href="/swagger-ui/index.html">Swagger</Nav.Link>
            )}
          </Nav>

          {/* ---- Everything else ---- */}
          <Navbar.Collapse className="justify-content-between">
            <Nav className="mr-auto">
              {/* ---------- Admin dropdown ---------- */}
              {(isAdmin || isProfessor) && (
                <NavDropdown
                  title="Admin"
                  id="appnavbar-admin-dropdown"
                  data-testid="appnavbar-admin-dropdown"
                >
                  {/* Users ⇢ admins only */}
                  {isAdmin && (
                    <NavDropdown.Item
                      as={Link}
                      to="/admin/users"
                      data-testid="appnavbar-users"
                    >
                      Users
                    </NavDropdown.Item>
                  )}

                  <NavDropdown.Item
                    as={Link}
                    to="/admin/requests"
                    data-testid="appnavbar-requests"
                  >
                    Requests
                  </NavDropdown.Item>
                </NavDropdown>
              )}

              {/* ---------- Settings dropdown (new) ---------- */}
              {(isAdmin || isProfessor) && (
                <NavDropdown
                  title="Settings"
                  id="appnavbar-settings-dropdown"
                  data-testid="appnavbar-settings-dropdown"
                >
                  <NavDropdown.Item
                    as={Link}
                    to="/settings/requesttypes"
                    data-testid="appnavbar-requesttypes"
                  >
                    Request Types
                  </NavDropdown.Item>
                </NavDropdown>
              )}

              {/* ---------- Professor links ---------- */}
              {isProfessor && (
                <>
                  <Nav.Link as={Link} to="/requests/pending">
                    Pending Requests
                  </Nav.Link>
                  <Nav.Link as={Link} to="/requests/completed">
                    Completed Requests
                  </Nav.Link>
                  <Nav.Link as={Link} to="/requests/statistics">
                    Statistics
                  </Nav.Link>
                </>
              )}
            </Nav>

            {/* ---- Right-aligned auth section ---- */}
            <Nav className="ml-auto">
              {isLoggedIn ? (
                <>
                  <Navbar.Text className="me-3" as={Link} to="/profile">
                    Welcome,&nbsp;{currentUser.root.user.email}
                  </Navbar.Text>
                  <Button onClick={doLogout}>Log Out</Button>
                </>
              ) : (
                <Button href={oauthLogin}>Log In</Button>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
}
