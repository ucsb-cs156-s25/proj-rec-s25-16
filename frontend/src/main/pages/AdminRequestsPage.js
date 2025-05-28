import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import RequestsTable from "main/components/RecommendationRequest/RecommendationRequestTable";

import { useBackend } from "main/utils/useBackend";
const AdminRequestsPage = () => {
  const {
    data: requests,
    error: _error,
    status: _status,
  } = useBackend(
    // Stryker disable next-line all : don't test internal caching of React Query
    ["/api/recommendationrequest/admin/all"],
    { method: "GET", url: "/api/recommendationrequest/admin/all" },
    [],
  );

  return (
    <BasicLayout>
      <h2>Requests</h2>
      <RequestsTable requests={requests} />
    </BasicLayout>
  );
};

export default AdminRequestsPage;
