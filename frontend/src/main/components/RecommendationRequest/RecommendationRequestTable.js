import React from "react";
import OurTable, { ButtonColumn } from "main/components/OurTable";

import { useBackendMutation } from "main/utils/useBackend";
import {
  cellToAxiosParamsDelete,
  onDeleteSuccess,
  cellToAxiosParamsUpdateStatus,
  onUpdateStatusSuccess,
} from "main/utils/RecommendationRequestUtils";
import { useNavigate } from "react-router-dom";
import { hasRole } from "main/utils/currentUser";
import { Dropdown, DropdownButton } from "react-bootstrap";
import { useQueryClient } from "react-query";

export default function RecommendationRequestTable({
  requests,
  currentUser,
  onPendingRequests = false,
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const editCallback = (cell) => {
    navigate(`/requests/edit/${cell.row.values.id}`);
  };

  // Stryker disable all : hard to test for query caching

  // when delete success, invalidate the correct query key (depending on user role)
  const apiEndpoint = hasRole(currentUser, "ROLE_PROFESSOR")
    ? "/api/recommendationrequest/professor/all"
    : "/api/recommendationrequest/requester/all";

  const deleteMutation = useBackendMutation(
    cellToAxiosParamsDelete,
    { onSuccess: onDeleteSuccess },
    [apiEndpoint],
  );

  // Stryker restore all

  // Stryker disable next-line all : TODO try to make a good test for this
  const deleteCallback = async (cell) => {
    deleteMutation.mutate(cell);
  };

  const updateStatusMutation = useBackendMutation(
    (params) => cellToAxiosParamsUpdateStatus(params.cell, params.newStatus),
    {
      onSuccess: (message) => {
        onUpdateStatusSuccess(message);
        // Refreshes the page immediately when status is changed by requiring a new GET call
        queryClient.invalidateQueries(apiEndpoint);
      },
    },
  );

  const StatusCell = ({ cell }) => {
    const [status, setStatus] = React.useState(cell.row.values.status);

    const handleClick = (eventKey) => {
      setStatus(eventKey);
      updateStatusMutation.mutate({ cell, newStatus: eventKey });
    };

    if (onPendingRequests && hasRole(currentUser, "ROLE_PROFESSOR")) {
      return (
        <DropdownButton
          title={status}
          data-testid={`status-dropdown-${cell.row.values.id}`}
          onSelect={handleClick}
        >
          <Dropdown.Item eventKey="PENDING">PENDING</Dropdown.Item>
          <Dropdown.Item eventKey="COMPLETED">COMPLETED</Dropdown.Item>
          <Dropdown.Item eventKey="DENIED">DENIED</Dropdown.Item>
        </DropdownButton>
      );
    } else {
      return (
        <span data-testid={`status-span-${cell.row.values.id}`}>
          {cell.row.values.status}
        </span>
      );
    }
  };

  const columns = [
    {
      Header: "id",
      accessor: "id", // accessor is the "key" in the data
    },
    {
      Header: "Professor Name",
      accessor: "professor.fullName",
    },
    {
      Header: "Professor Email",
      accessor: "professor.email",
    },
    {
      Header: "Requester Name",
      accessor: "requester.fullName",
    },
    {
      Header: "Requester Email",
      accessor: "requester.email",
    },
    {
      Header: "Recommendation Type",
      accessor: "recommendationType",
    },
    {
      Header: "Details",
      accessor: "details",
    },
    {
      Header: "Status",
      accessor: "status",
      Cell: StatusCell,
    },
    {
      Header: "Submission Date",
      accessor: "submissionDate",
    },
    {
      Header: "Last Modified Date",
      accessor: "lastModifiedDate",
    },
    {
      Header: "Completion Date",
      accessor: "completionDate",
    },
    {
      Header: "Due Date",
      accessor: "dueDate",
    },
  ];

  //since all admins have the role of a user, we can just check if the current user has the role ROLE_USER
  if (hasRole(currentUser, "ROLE_USER")) {
    columns.push(
      ButtonColumn(
        "Delete",
        "danger",
        deleteCallback,
        "RecommendationRequestTable",
      ),
    );
  }

  if (
    hasRole(currentUser, "ROLE_USER") &&
    !hasRole(currentUser, "ROLE_ADMIN")
  ) {
    columns.push(
      ButtonColumn(
        "Edit",
        "primary",
        editCallback,
        "RecommendationRequestTable",
      ),
    );
  }

  return (
    <OurTable
      data={requests}
      columns={columns}
      testid={"RecommendationRequestTable"}
    />
  );
}
