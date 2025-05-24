import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "main/pages/HomePage";
import ProfilePage from "main/pages/ProfilePage";
import AdminUsersPage from "main/pages/AdminUsersPage";

import PendingRequestsPage from "main/pages/Requests/PendingRequestsPage";
import CompletedRequestsPage from "main/pages/Requests/CompletedRequestsPage";
import StatisticsPage from "main/pages/Requests/StatisticsPage";

import RequestTypesIndexPage from "main/pages/RequestType/RequestTypesIndexPage";
import RequestTypesCreatePage from "main/pages/RequestType/RequestTypesCreatePage";
import RequestTypesEditPage from "main/pages/RequestType/RequestTypesEditPage";

import { hasRole, useCurrentUser } from "main/utils/currentUser";

import "bootstrap/dist/css/bootstrap.css";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const { data: currentUser } = useCurrentUser();

  return (
    <BrowserRouter>
      <Routes>
        <Route exact path="/" element={<HomePage />} />
        <Route exact path="/profile" element={<ProfilePage />} />

        {hasRole(currentUser, "ROLE_ADMIN") && (
          <Route exact path="/admin/users" element={<AdminUsersPage />} />
        )}

        {(hasRole(currentUser, "ROLE_PROFESSOR") ||
          hasRole(currentUser, "ROLE_STUDENT")) && (
          <>
            <Route
              exact
              path="/requests/pending"
              element={<PendingRequestsPage />}
            />
            <Route
              exact
              path="/requests/completed"
              element={<CompletedRequestsPage />}
            />
            <Route
              exact
              path="/requests/statistics"
              element={<StatisticsPage />}
            />
          </>
        )}

        {(hasRole(currentUser, "ROLE_ADMIN") ||
          hasRole(currentUser, "ROLE_PROFESSOR")) && (
          <>
            <Route
              exact
              path="/settings/requesttypes"
              element={<RequestTypesIndexPage />}
            />
            <Route
              exact
              path="/settings/requesttypes/create"
              element={<RequestTypesCreatePage />}
            />
            <Route
              exact
              path="/settings/requesttypes/create/:id"
              element={<RequestTypesEditPage />}
            />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
