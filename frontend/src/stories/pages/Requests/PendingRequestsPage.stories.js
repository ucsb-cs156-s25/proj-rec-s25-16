import React from "react";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { recommendationRequestFixtures } from "fixtures/recommendationRequestFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import PendingRequestsPage from "main/pages/Requests/PendingRequestsPage";
import { http, HttpResponse } from "msw";

export default {
  title: "pages/Requests/PendingRequestsPage",
  component: PendingRequestsPage,
};

const Template = () => <PendingRequestsPage />;

export const Empty = Template.bind({});
Empty.parameters = {
  msw: [
    http.get("/api/currentUser", () => {
      return HttpResponse.json(apiCurrentUserFixtures.professorUser);
    }),
    http.get("/api/systemInfo", () => {
      return HttpResponse.json(systemInfoFixtures.showingNeither);
    }),
    http.get("/api/recommendationrequest/professor/all", () => {
      return HttpResponse.json([]);
    }),
  ],
};

export const PendingRequestsProfessorUser = Template.bind({});
PendingRequestsProfessorUser.parameters = {
  msw: [
    http.get("/api/currentUser", () => {
      return HttpResponse.json(apiCurrentUserFixtures.professorUser);
    }),
    http.get("/api/systemInfo", () => {
      return HttpResponse.json(systemInfoFixtures.showingNeither);
    }),
    http.get("/api/recommendationrequest/professor/all", () => {
      return HttpResponse.json([
        recommendationRequestFixtures.mixedRequests[2],
      ]);
    }),
    http.get("/api/recommendationrequest/requester/all", () => {
      return HttpResponse.json([
        recommendationRequestFixtures.mixedRequests[2],
      ]);
    }),
  ],
};

export const PendingRequestsStudentUser = Template.bind({});
PendingRequestsStudentUser.parameters = {
  msw: [
    http.get("/api/currentUser", () => {
      return HttpResponse.json(apiCurrentUserFixtures.studentUser);
    }),
    http.get("/api/systemInfo", () => {
      return HttpResponse.json(systemInfoFixtures.showingNeither);
    }),
    http.get("/api/recommendationrequest/requester/all", () => {
      return HttpResponse.json([
        recommendationRequestFixtures.mixedRequests[2],
      ]);
    }),
    http.get("/api/recommendationrequest/professor/all", () => {
      return HttpResponse.json([
        recommendationRequestFixtures.mixedRequests[2],
      ]);
    }),
  ],
};
