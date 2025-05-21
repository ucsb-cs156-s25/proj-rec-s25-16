import React from "react";
import RecommendationRequestForm from "main/components/RecommendationRequest/RecommendationRequestForm";
import { useBackendMutation } from "main/utils/useBackend";
import { useNavigate } from "react-router-dom";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { toast } from "react-toastify";

export default function CreateRecommendationRequestPage() {
  const navigate = useNavigate();

  const objectToAxiosParams = (recommendationRequest) => {
    const params = {
      professorId: recommendationRequest.professor_id,
      recommendationType: recommendationRequest.recommendationType,
      details: recommendationRequest.details,
      dueDate: new Date(recommendationRequest.dueDate).toISOString(),
    };

    return {
      url: "/api/recommendationrequest/post",
      method: "POST",
      params: params,
    };
  };

  const onSuccess = () => {
    navigate("/student/profile");
    toast("Recommendation request created successfully!");
  };

  const mutation = useBackendMutation(objectToAxiosParams, { onSuccess });

  return (
    <BasicLayout>
      <div className="container mt-4">
        <h1>Create Recommendation Request</h1>
        <RecommendationRequestForm
          submitAction={mutation.mutate}
          buttonLabel="Create"
        />
      </div>
    </BasicLayout>
  );
}
