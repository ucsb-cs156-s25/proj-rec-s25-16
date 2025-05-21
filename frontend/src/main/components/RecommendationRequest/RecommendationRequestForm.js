import { Button, Form, Row, Col } from "react-bootstrap";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

function RecommendationRequestForm({
  initialContents,
  submitAction,
  buttonLabel = "Create",
  recommendationTypeVals = [],
  professorVals = [],
  readOnlyFields = [],
}) {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({ defaultValues: initialContents || {} });

  const [professors, setProfessors] = useState(professorVals);
  const [recommendationTypes, setRecommendationTypes] = useState(
    recommendationTypeVals,
  );

  useEffect(() => {
    const getProfessors = async () => {
      try {
        const response = await fetch("/api/admin/users/professors");
        const data = await response.json();
        setProfessors(data);
      } catch (error) {
        console.error("Error fetching professors");
      }
    };
    const getRequestTypes = async () => {
      try {
        const response = await fetch("/api/requesttypes/all");
        const data = await response.json();
        setRecommendationTypes(data);
      } catch (error) {
        console.error("Error fetching request types");
      }
    };

    getProfessors();
    getRequestTypes();
  }, []);

  const navigate = useNavigate();

  return (
    <Form onSubmit={handleSubmit(submitAction)}>
      <Row>
        {initialContents && (
          <Col>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="id">Id</Form.Label>
              <Form.Control
                data-testid="RecommendationRequestForm-id"
                id="id"
                type="text"
                {...register("id")}
                value={initialContents.id}
                disabled
              />
            </Form.Group>
          </Col>
        )}
        <Col>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="professor_id">Professor</Form.Label>
            <Form.Select
              data-testid="RecommendationRequestForm-professor_id"
              id="professor_id"
              isInvalid={Boolean(errors.professor_id)}
              {...register("professor_id", {
                required: readOnlyFields.includes("professor_id")
                  ? false
                  : "Please select a professor",
              })}
              defaultValue=""
              disabled={readOnlyFields.includes("professor_id")}
            >
              <option disabled value="">
                Select a professor
              </option>
              {Array.isArray(professors) &&
                professors.map((professor) => (
                  <option key={professor.id} value={professor.id}>
                    {professor.fullName}
                  </option>
                ))}
              <option value="-1">Other</option>
            </Form.Select>
            {errors.professor_id && (
              <Form.Control.Feedback type="invalid">
                {errors.professor_id.message}
              </Form.Control.Feedback>
            )}
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="recommendationType">
              Recommendation Type
            </Form.Label>
            <Form.Select
              data-testid="RecommendationRequestForm-recommendationType"
              id="recommendationType"
              isInvalid={Boolean(errors.recommendationType)}
              {...register("recommendationType", {
                required: readOnlyFields.includes("recommendationType")
                  ? false
                  : "Please select a recommendation type",
              })}
              defaultValue=""
              disabled={readOnlyFields.includes("recommendationType")}
            >
              {Array.isArray(recommendationTypes) &&
              recommendationTypes.length > 0 ? (
                <>
                  <option disabled value="">
                    Select a recommendation type
                  </option>
                  {recommendationTypes.map((recommendationType) => (
                    <option
                      key={recommendationType.id}
                      value={recommendationType.requestType}
                    >
                      {recommendationType.requestType}
                    </option>
                  ))}
                </>
              ) : (
                <option disabled value="">
                  No recommendation types available, use Other in details
                </option>
              )}
              <option value="Other">Other</option>
            </Form.Select>
            {errors.recommendationType && (
              <Form.Control.Feedback type="invalid">
                {errors.recommendationType.message}
              </Form.Control.Feedback>
            )}
          </Form.Group>
        </Col>
        <Col>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="details">Details</Form.Label>
            <Form.Control
              data-testid="RecommendationRequestForm-details"
              id="details"
              type="text"
              isInvalid={Boolean(errors.details)}
              {...register("details")}
              disabled={readOnlyFields.includes("details")}
            />
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="dueDate">Due Date</Form.Label>
            <Form.Control
              data-testid="RecommendationRequestForm-dueDate"
              id="dueDate"
              type="datetime-local"
              isInvalid={Boolean(errors.dueDate)}
              {...register("dueDate", {
                required: readOnlyFields.includes("dueDate")
                  ? false
                  : "Due date is required",
              })}
              disabled={readOnlyFields.includes("dueDate")}
            />
            {errors.dueDate && (
              <Form.Control.Feedback type="invalid">
                {errors.dueDate.message}
              </Form.Control.Feedback>
            )}
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col>
          <Button type="submit" data-testid="RecommendationRequestForm-submit">
            {buttonLabel}
          </Button>
          <Button
            variant="Secondary"
            onClick={() => navigate(-1)}
            data-testid="RecommendationRequestForm-cancel"
          >
            Cancel
          </Button>
        </Col>
      </Row>
    </Form>
  );
}

RecommendationRequestForm.propTypes = {
  initialContents: PropTypes.object,
  submitAction: PropTypes.func.isRequired,
  buttonLabel: PropTypes.string,
  recommendationTypeVals: PropTypes.array,
  professorVals: PropTypes.array,
  readOnlyFields: PropTypes.arrayOf(PropTypes.string),
};

export default RecommendationRequestForm;
