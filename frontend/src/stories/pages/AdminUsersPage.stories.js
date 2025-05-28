import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { http, HttpResponse } from "msw";

import AdminUsersPage from "main/pages/AdminUsersPage";

export default {
  title: "pages/AdminUsersPage",
  component: AdminUsersPage,
};

const Template = () => <AdminUsersPage />;

// Mock user data for different scenarios - matching UsersTable structure
const mockUsers = {
  emptyList: [],

  fewUsers: [
    {
      id: 1,
      email: "john.doe@example.com",
      givenName: "John",
      familyName: "Doe",
      admin: false,
      professor: false,
    },
    {
      id: 2,
      email: "jane.smith@example.com",
      givenName: "Jane",
      familyName: "Smith",
      admin: true,
      professor: false,
    },
    {
      id: 3,
      email: "prof.johnson@example.com",
      givenName: "Robert",
      familyName: "Johnson",
      admin: false,
      professor: true,
    },
  ],

  manyUsers: [
    {
      id: 1,
      email: "john.doe@example.com",
      givenName: "John",
      familyName: "Doe",
      admin: false,
      professor: false,
    },
    {
      id: 2,
      email: "jane.smith@example.com",
      givenName: "Jane",
      familyName: "Smith",
      admin: true,
      professor: false,
    },
    {
      id: 3,
      email: "prof.johnson@example.com",
      givenName: "Robert",
      familyName: "Johnson",
      admin: false,
      professor: true,
    },
    {
      id: 4,
      email: "admin.user@example.com",
      givenName: "Admin",
      familyName: "User",
      admin: true,
      professor: true,
    },
    {
      id: 5,
      email: "student1@example.com",
      givenName: "Student",
      familyName: "One",
      admin: false,
      professor: false,
    },
    {
      id: 6,
      email: "student2@example.com",
      givenName: "Student",
      familyName: "Two",
      admin: false,
      professor: false,
    },
    {
      id: 7,
      email: "prof.williams@example.com",
      givenName: "Sarah",
      familyName: "Williams",
      admin: false,
      professor: true,
    },
    {
      id: 8,
      email: "super.admin@example.com",
      givenName: "Super",
      familyName: "Admin",
      admin: true,
      professor: false,
    },
  ],
};

export const EmptyUsers = Template.bind({});
EmptyUsers.parameters = {
  msw: {
    handlers: [
      http.get("/api/currentUser", () => {
        return HttpResponse.json(apiCurrentUserFixtures.adminUser);
      }),
      http.get("/api/systemInfo", () => {
        return HttpResponse.json(systemInfoFixtures.showingNeither);
      }),
      http.get("/api/admin/users", () => {
        return HttpResponse.json(mockUsers.emptyList);
      }),
      // Mock the toggle endpoints
      http.post("/api/admin/users/toggleAdmin", () => {
        return HttpResponse.json({ message: "Admin toggled successfully" });
      }),
      http.post("/api/admin/users/toggleProfessor", () => {
        return HttpResponse.json({ message: "Professor toggled successfully" });
      }),
    ],
  },
};

export const FewUsers = Template.bind({});
FewUsers.parameters = {
  msw: {
    handlers: [
      http.get("/api/currentUser", () => {
        return HttpResponse.json(apiCurrentUserFixtures.adminUser);
      }),
      http.get("/api/systemInfo", () => {
        return HttpResponse.json(systemInfoFixtures.showingNeither);
      }),
      http.get("/api/admin/users", () => {
        return HttpResponse.json(mockUsers.fewUsers);
      }),
      // Mock the toggle endpoints
      http.post("/api/admin/users/toggleAdmin", () => {
        return HttpResponse.json({ message: "Admin toggled successfully" });
      }),
      http.post("/api/admin/users/toggleProfessor", () => {
        return HttpResponse.json({ message: "Professor toggled successfully" });
      }),
    ],
  },
};

export const ManyUsers = Template.bind({});
ManyUsers.parameters = {
  msw: {
    handlers: [
      http.get("/api/currentUser", () => {
        return HttpResponse.json(apiCurrentUserFixtures.adminUser);
      }),
      http.get("/api/systemInfo", () => {
        return HttpResponse.json(systemInfoFixtures.showingNeither);
      }),
      http.get("/api/admin/users", () => {
        return HttpResponse.json(mockUsers.manyUsers);
      }),
      // Mock the toggle endpoints
      http.post("/api/admin/users/toggleAdmin", () => {
        return HttpResponse.json({ message: "Admin toggled successfully" });
      }),
      http.post("/api/admin/users/toggleProfessor", () => {
        return HttpResponse.json({ message: "Professor toggled successfully" });
      }),
    ],
  },
};

export const LoadingState = Template.bind({});
LoadingState.parameters = {
  msw: {
    handlers: [
      http.get("/api/currentUser", () => {
        return HttpResponse.json(apiCurrentUserFixtures.adminUser);
      }),
      http.get("/api/systemInfo", () => {
        return HttpResponse.json(systemInfoFixtures.showingNeither);
      }),
      http.get("/api/admin/users", async () => {
        // Simulate a slow API response to show loading state
        await new Promise((resolve) => setTimeout(resolve, 2000));
        return HttpResponse.json(mockUsers.fewUsers);
      }),
      // Mock the toggle endpoints
      http.post("/api/admin/users/toggleAdmin", () => {
        return HttpResponse.json({ message: "Admin toggled successfully" });
      }),
      http.post("/api/admin/users/toggleProfessor", () => {
        return HttpResponse.json({ message: "Professor toggled successfully" });
      }),
    ],
  },
};

export const ErrorState = Template.bind({});
ErrorState.parameters = {
  msw: {
    handlers: [
      http.get("/api/currentUser", () => {
        return HttpResponse.json(apiCurrentUserFixtures.adminUser);
      }),
      http.get("/api/systemInfo", () => {
        return HttpResponse.json(systemInfoFixtures.showingNeither);
      }),
      http.get("/api/admin/users", () => {
        return HttpResponse.json(
          { message: "Internal server error" },
          { status: 500 },
        );
      }),
      // Mock the toggle endpoints
      http.post("/api/admin/users/toggleAdmin", () => {
        return HttpResponse.json({ message: "Admin toggled successfully" });
      }),
      http.post("/api/admin/users/toggleProfessor", () => {
        return HttpResponse.json({ message: "Professor toggled successfully" });
      }),
    ],
  },
};
