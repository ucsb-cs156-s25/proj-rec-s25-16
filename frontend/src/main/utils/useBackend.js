import { useQuery, useMutation, useQueryClient } from "react-query";
import axios from "axios";
import { toast } from "react-toastify";

export function useBackend(queryKey, axiosParameters, initialData) {
  return useQuery(
    queryKey,
    async () => {
      try {
        const response = await axios(axiosParameters);
        return response.data;
      } catch (e) {
        const errorMessage = `Error communicating with backend via ${axiosParameters.method} on ${axiosParameters.url}`;
        toast(errorMessage);
        console.error(errorMessage, e);
        throw e;
      }
    },
    {
      initialData,
    },
  );
}

const reportAxiosError = (error) => {
  console.error("Axios Error:", error);
  toast(`Axios Error: ${error}`);
  return null;
};

const wrappedParams = async (params) => {
  try {
    return await (
      await axios(params)
    ).data;
  } catch (rejectedValue) {
    reportAxiosError(rejectedValue);
    throw rejectedValue;
  }
};

export function useBackendMutation(
  objectToAxiosParams,
  useMutationParams,
  queryKey = null,
) {
  const queryClient = useQueryClient();

  return useMutation((object) => wrappedParams(objectToAxiosParams(object)), {
    onError: (data) => {
      toast(`${data}`);
    },
    onSettled: () => {
      if (queryKey !== null) queryClient.invalidateQueries(queryKey);
    },
    retry: false,
    ...useMutationParams,
  });
}
