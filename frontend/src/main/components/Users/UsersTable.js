import OurTable, { ButtonColumn } from "main/components/OurTable";
import { useBackendMutation } from "main/utils/useBackend";

export default function UsersTable({ users }) {

  //toggleAdmin
  // Stryker disable next-line all : TODO try to make a good test for this
  function cellToAxiosParamsToggleAdmin(cell) {
    return {
      url: "/api/admin/users/toggleAdmin",
      method: "POST",
      params: {
        id: cell.row.values.id,
      },
    };
  }

  // Stryker disable all : hard to test for query caching
  const toggleAdminMutation = useBackendMutation(
    cellToAxiosParamsToggleAdmin,
    {},
    ["/api/admin/users"],
  );
  // Stryker enable all

  // Stryker disable next-line all : TODO try to make a good test for this
  const toggleAdminCallback = async (cell) => {
    toggleAdminMutation.mutate(cell);
  };

  function cellToAxiosParamsToggleProfessor(cell) {
    return {
      url: "/api/admin/users/toggleProfessor",
      method: "POST",
      params: {
        id: cell.row.values.id,
      },
    };
  }

  // Stryker disable all : hard to test for query caching
  const toggleProfessorMutation = useBackendMutation(
    cellToAxiosParamsToggleProfessor,
    {},
    ["/api/admin/users"],
  );
  // Stryker enable all

  // Stryker disable next-line all : TODO try to make a good test for this
  const toggleProfessorCallback = async (cell) => {
    toggleProfessorMutation.mutate(cell);
  };

  const columns = [
    {
      Header: "id",
      accessor: "id", // accessor is the "key" in the data
    },
    {
      Header: "First Name",
      accessor: "givenName",
    },
    {
      Header: "Last Name",
      accessor: "familyName",
    },
    {
      Header: "Email",
      accessor: "email",
    },
    {
      Header: "Admin",
      id: "admin",
      accessor: (row, _rowIndex) => String(row.admin), // hack needed for boolean values to show up
    },
    {
      Header: "Professor",
      id: "professor",
      accessor: (row, _rowIndex) => String(row.professor), // hack needed for boolean values to show up
    },
  ];

  const buttonColumn = [
    ...columns,
    ButtonColumn("Toggle Admin", "primary", toggleAdminCallback, "UsersTable"),
    ButtonColumn(
      "Toggle Professor",
      "success",
      toggleProfessorCallback,
      "UsersTable",
    ),
  ];

  return <OurTable data={users} columns={buttonColumn} testid={"UsersTable"} />;
}
