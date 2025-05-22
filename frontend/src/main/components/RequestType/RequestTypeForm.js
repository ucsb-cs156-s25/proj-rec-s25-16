import { Button, Form } from "react-bootstrap";
import { useForm } from "react-hook-form";

function RequestTypeForm({
  initialContents = {},
  submitAction,
  buttonLabel = "Create",
}) {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({ defaultValues: initialContents });

  return (
    <Form onSubmit={handleSubmit(submitAction)}>
      <Form.Group className="mb-3">
        <Form.Label htmlFor="requestType">Request Type</Form.Label>
        <Form.Control
          data-testid="RequestTypeForm-requestType"
          id="requestType"
          type="text"
          isInvalid={Boolean(errors.requestType)}
          {...register("requestType", { required: "Request type is required" })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.requestType?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Button type="submit" data-testid="RequestTypeForm-submit">
        {buttonLabel}
      </Button>
    </Form>
  );
}

export default RequestTypeForm;
