import React from "react";
import RecommendationRequestForm from "main/components/RecommendationRequest/RecommendationRequestForm";
import { useParams, useNavigate } from "react-router-dom";
import { useBackend, useBackendMutation } from "main/utils/useBackend";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { toast } from "react-toastify";

export default function EditRecommendationRequestPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    data: recommendationRequest,
    error: fetchError,
    status: fetchStatus,
  } = useBackend(
    [`/api/recommendationrequest?id=${id}`],
    { method: "GET", url: "/api/recommendationrequest", params: { id } },
    null,
  );

  const objectToAxiosParams = (updatedRequest) => {
    return {
      url: "/api/recommendationrequest",
      method: "PUT",
      params: { id: id },
      data: {
        id: parseInt(id),
        details: updatedRequest.details,

        recommendationType: recommendationRequest.recommendationType,
        dueDate: recommendationRequest.dueDate,

        status: recommendationRequest.status,
        professor: recommendationRequest.professor,
        requester: recommendationRequest.requester,
      },
    };
  };

  const onSuccess = () => {
    toast.success("Recommendation request updated successfully");
    navigate("/student/profile");
  };

  const mutation = useBackendMutation(objectToAxiosParams, { onSuccess }, [
    "/api/recommendationrequest/requester/all",
  ]);

  return (
    <BasicLayout>
      <div className="container mt-4">
        <h1>Edit Recommendation Request</h1>
        {fetchError && (
          <div className="alert alert-danger">
            Error loading recommendation request: {fetchError.message}
          </div>
        )}
        {fetchStatus === "loading" && (
          <div className="alert alert-info">
            Loading recommendation request...
          </div>
        )}
        {recommendationRequest && (
          <RecommendationRequestForm
            initialContents={recommendationRequest}
            submitAction={mutation.mutate}
            buttonLabel="Update"
            readOnlyFields={["professor_id", "recommendationType", "dueDate"]}
          />
        )}
      </div>
    </BasicLayout>
  );
}
