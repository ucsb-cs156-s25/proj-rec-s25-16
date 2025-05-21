import React from "react";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import RecommendationRequestTable from "main/components/RecommendationRequest/RecommendationRequestTable";
import { useBackend } from "main/utils/useBackend";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { useCurrentUser } from "main/utils/currentUser";

export default function StudentProfilePage() {
  const navigate = useNavigate();
  const { data: currentUser } = useCurrentUser();

  const {
    data: requests,
    error,
    status,
  } = useBackend(
    ["/api/recommendationrequest/requester/all"],
    { method: "GET", url: "/api/recommendationrequest/requester/all" },
    [],
  );

  return (
    <BasicLayout>
      <div className="container mt-4">
        <h1>My Recommendation Requests</h1>
        <Button
          data-testid="create-new"
          className="mb-3"
          onClick={() => navigate("/student/recommendations/create")}
        >
          Create New Request
        </Button>
        {error && (
          <div className="alert alert-danger">
            Error loading recommendation requests:{" "}
            {error.message || String(error)}
          </div>
        )}
        {status === "loading" && (
          <div className="alert alert-info">
            Loading recommendation requests...
          </div>
        )}
        {requests === undefined ? (
          <div className="alert alert-warning">No requests data available</div>
        ) : (
          <RecommendationRequestTable
            requests={requests || []}
            currentUser={currentUser || {}}
          />
        )}
      </div>
    </BasicLayout>
  );
}
