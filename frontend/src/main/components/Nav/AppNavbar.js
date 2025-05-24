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
  const isStudent = hasRole(currentUser, "ROLE_STUDENT");
  const isLoggedIn = currentUser && currentUser.loggedIn;

  return (
    <>
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
          <Navbar.Brand as={Link} to="/">
            Rec Manager
          </Navbar.Brand>
          <Navbar.Toggle />

          <Nav className="me-auto">
            {systemInfo?.springH2ConsoleEnabled && (
              <Nav.Link href="/h2-console">H2Console</Nav.Link>
            )}
            {systemInfo?.showSwaggerUILink && (
              <Nav.Link href="/swagger-ui/index.html">Swagger</Nav.Link>
            )}
          </Nav>

          <Navbar.Collapse className="justify-content-between">
            <Nav className="mr-auto">
              {(isAdmin || isProfessor) && (
                <NavDropdown
                  title="Admin"
                  id="appnavbar-admin-dropdown"
                  data-testid="appnavbar-admin-dropdown"
                >
                  {isAdmin && (
                    <NavDropdown.Item href="/admin/users">
                      Users
                    </NavDropdown.Item>
                  )}
                  <NavDropdown.Item as={Link} to="/settings/requesttypes">
                    Request Types
                  </NavDropdown.Item>
                </NavDropdown>
              )}

              {(isProfessor || isStudent) && (
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

            <Nav className="ml-auto">
              {isLoggedIn ? (
                <>
                  <Navbar.Text className="me-3" as={Link} to="/profile">
                    Welcome, {currentUser.root.user.email}
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
