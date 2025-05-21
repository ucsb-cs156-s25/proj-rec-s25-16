import { toast } from "react-toastify";

export function onDeleteSuccess(message) {
  console.log(message);
  toast(message);
}

export function cellToAxiosParamsDelete(cell, isAdmin) {
  const urlCalled = isAdmin
    ? "/api/recommendationrequest/admin"
    : "/api/recommendationrequest";
  return {
    url: urlCalled,
    method: "DELETE",
    params: {
      id: cell.row.values.id,
    },
  };
}

export function onUpdateStatusSuccess(message) {
  console.log(message);
  toast(message);
}

export function cellToAxiosParamsUpdateStatus(cell, newStatus) {
  return {
    url: "/api/recommendationrequest/professor",
    method: "PUT",
    params: { id: cell.row.values.id },
    data: { status: newStatus },
  };
}
