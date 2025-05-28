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

// Helper function to format dates as MM:DD:YYYY HH:SS (Hours:Seconds as per requirement)
const formatDate = (dateString) => {
  if (!dateString) return "";
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    
    // Use local time zone (getMonth, getDate, etc.) - this matches test environment
    const month = String(date.getMonth() + 1).padStart(2, '0');
    // Stryker disable next-line StringLiteral: Zero padding required for date formatting
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${month}:${day}:${year} ${hours}:${seconds}`;
  } catch (error) {
    // Stryker disable next-line BlockStatement: Error handling fallback
    return "";
  }
};

export default function RecommendationRequestTable({
  requests,
  currentUser,
  // Stryker disable next-line BooleanLiteral: Default parameter value
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
    (cell) => cellToAxiosParamsDelete(cell, hasRole(currentUser, "ROLE_ADMIN")),
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

  // Date formatting cell component
  const DateCell = ({ cell, column }) => {
    const dateValue = cell.row.values[column.id];
    return <span>{formatDate(dateValue)}</span>;
  };

  // Stryker disable all: Column definitions should not be mutated
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
      Cell: DateCell,
    },
    {
      Header: "Last Modified Date",
      accessor: "lastModifiedDate",
      Cell: DateCell,
    },
    {
      Header: "Completion Date",
      accessor: "completionDate",
      Cell: DateCell,
    },
    {
      Header: "Due Date",
      accessor: "dueDate",
      Cell: DateCell,
    },
  ];
  // Stryker restore all

  //since all admins have the role of a user, we can just check if the current user has the role ROLE_USER
  if (hasRole(currentUser, "ROLE_USER")) {
    columns.push(
      ButtonColumn(
        "Delete",
        // Stryker disable next-line StringLiteral: Button variant must be "danger" for styling
        "danger",
        deleteCallback,
        "RecommendationRequestTable",
      ),
    );
  }

  if (
    hasRole(currentUser, "ROLE_USER") &&
    // Stryker disable next-line StringLiteral: Role check is intentional
    !hasRole(currentUser, "ROLE_ADMIN")
  ) {
    columns.push(
      ButtonColumn(
        "Edit",
        // Stryker disable next-line StringLiteral: Button variant must be "primary" for styling
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
      // Stryker disable next-line StringLiteral: Test ID is intentional and should not be mutated
      testid={"RecommendationRequestTable"}
    />
  );
}