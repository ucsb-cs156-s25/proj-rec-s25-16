package edu.ucsb.cs156.rec.controllers;

import edu.ucsb.cs156.rec.entities.RecommendationRequest;
import edu.ucsb.cs156.rec.entities.RequestType;
import edu.ucsb.cs156.rec.entities.User;
import edu.ucsb.cs156.rec.errors.EntityNotFoundException;
import edu.ucsb.cs156.rec.models.CurrentUser;
import edu.ucsb.cs156.rec.repositories.RecommendationRequestRepository;
import edu.ucsb.cs156.rec.repositories.RequestTypeRepository;
import edu.ucsb.cs156.rec.repositories.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;

@Tag(name = "RecommendationRequest")
@RequestMapping("/api/recommendationrequest")
@RestController
@Slf4j
public class RecommendationRequestController extends ApiController {
  
    @Autowired
    RecommendationRequestRepository recommendationRequestRepository;

    @Autowired
    UserRepository userRepository;

    @Autowired
    RequestTypeRepository requestTypeRepository;

    /**
     * This method returns a list of all Recommendation Requests requested
     * @return a list of all Recommendation Requests requested by all students
     */
    @Operation(summary = "An admin can list all Recommendation Requests")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping("/admin/all")
    public Iterable<RecommendationRequest> getAllRecommendationRequests() {
        return recommendationRequestRepository.findAll();
    }

    /**
     * Any admin can delete a RecommendationRequest
     * 
     * @param id the id of the RecommendationRequest to delete
     * @return a message indicating that the RecommendationRequest was deleted
     */
    @Operation(summary = "An admin can delete a RecommendationRequest")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @DeleteMapping("/admin")
    public Object deleteRecommendationRequestAsAdmin(@Parameter(name = "id") @RequestParam Long id) {
        RecommendationRequest recommendationRequest = 
        recommendationRequestRepository
            .findById(id)
            .orElseThrow(() -> new EntityNotFoundException(RecommendationRequest.class, id));

        recommendationRequestRepository.delete(recommendationRequest);

        return genericMessage("RecommendationRequest with id %s deleted".formatted(id));
    }

    /**
     * The user who posted a RecommendationRequest can delete their RecommendationRequest
     * 
     * @param id the id of the RecommendationRequest to delete
     * @return a message indicating that the RecommendationRequest was deleted
     */
    @Operation(summary = "User can delete their RecommendationRequest")
    @PreAuthorize("hasRole('ROLE_USER')")
    @DeleteMapping("")
    public Object deleteRecommendationRequestAsUser(@Parameter(name = "id") @RequestParam Long id) {
        User currentUser = getCurrentUser().getUser(); 
        RecommendationRequest recommendationRequest = 
        recommendationRequestRepository
            .findByIdAndRequester(id, currentUser)
            .orElseThrow(() -> new EntityNotFoundException(RecommendationRequest.class, id));

        recommendationRequestRepository.delete(recommendationRequest);

        return genericMessage("RecommendationRequest with id %s deleted".formatted(id));
    }

    /**
     * The user who posted a RecommendationRequest can update their RecommendationRequest
     * 
     * @param id       the id of the Recommendation Request to update
     * @param incoming the updated Recommendation Request
     * @return the updated Recommendation Request object
     */
    @Operation(summary = "User can update their RecommendationRequest")
    @PreAuthorize("hasRole('ROLE_USER')")
    @PutMapping("")
    public RecommendationRequest updateRecommendationRequestAsUser( 
        @Parameter(name = "id") @RequestParam Long id,
        @RequestBody @Valid RecommendationRequest incoming) {

        User currentUser = getCurrentUser().getUser(); 
        RecommendationRequest recommendationRequest = 
            recommendationRequestRepository
                .findByIdAndRequester(id, currentUser)
                .orElseThrow(() -> new EntityNotFoundException(RecommendationRequest.class, id));

        recommendationRequest.setDetails(incoming.getDetails());

        recommendationRequestRepository.save(recommendationRequest);
           
        return recommendationRequest;    
    }

     /**
     * Prof can update a Recommendation Request's status
     * 
     * @param id       the id of the Recommendation Request to update
     * @param incoming the updated Recommendation Request
     * @return the updated Recommendation Request object
     */
    @Operation(summary = "A Professor can update a recommendation request's status")
    @PreAuthorize("hasRole('ROLE_PROFESSOR')")
    @PutMapping("/professor")
    public RecommendationRequest updateRecommendationRequestAsAdmin(
        @Parameter(name = "id") @RequestParam Long id,
        @RequestBody @Valid RecommendationRequest incoming) {

        RecommendationRequest recommendationRequest = 
            recommendationRequestRepository
                .findById(id)
                .orElseThrow(() -> new EntityNotFoundException(RecommendationRequest.class, id));

        recommendationRequest.setStatus(incoming.getStatus());

        if("COMPLETED".equals(incoming.getStatus()) || "DENIED".equals(incoming.getStatus())) {
            recommendationRequest.setCompletionDate(LocalDateTime.now());
        }

        recommendationRequestRepository.save(recommendationRequest);

        return recommendationRequest;
    }

    /**
     * This method returns a list of all Recommendation Requests requested by current student.
     * @return a list of all Recommendation Requests requested by the current user
     */
    @Operation(summary = "List all Recommendation Requests requested by current user")
    @PreAuthorize("hasRole('ROLE_USER')")
    @GetMapping("/requester/all")
    public Iterable<RecommendationRequest> allRequesterRecommendationRequests(
    ) {
        // toyed with having this only be ROLE_STUDENT but I think even professors should be able to submit requests so they can see which ones they have submitted too
        User currentUser = getCurrentUser().getUser();
        Iterable<RecommendationRequest> recommendationRequests = recommendationRequestRepository.findAllByRequesterId(currentUser.getId());
        return recommendationRequests;
    }

    /**
     * This method returns a list of all Recommendation Requests intended for current user who is a professor.
     * @return a list of all Recommendation Requests intended for the current user who is a professor
     */
    @Operation(summary = "List all Recommendation Requests for professor")
    @PreAuthorize("hasRole('ROLE_PROFESSOR')")
    @GetMapping("/professor/all")
    public Iterable<RecommendationRequest> allProfessorRecommendationRequests(
    ) {
        User currentUser = getCurrentUser().getUser();
        Iterable<RecommendationRequest> recommendationRequests = recommendationRequestRepository.findAllByProfessorId(currentUser.getId());
        return recommendationRequests;
    }

    /**
     * This method returns a single recommendation request where the current user is either the requester or the professor.
     * @param id id of the Recommendation Requests to get
     * @return a single recommendation request where the current user is either the requester or the professor
     */
    @Operation(summary = "Get a single recommendation request where the current user is either the requester or the professor")
    @PreAuthorize("hasRole('ROLE_USER')")
    @GetMapping("")
    public RecommendationRequest getById(
            @Parameter(name = "id") @RequestParam Long id) {
            Long currentUserId = getCurrentUser().getUser().getId();
            RecommendationRequest recommendationRequest = recommendationRequestRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(RecommendationRequest.class, id));
            if (recommendationRequest.getRequester().getId() != currentUserId && recommendationRequest.getProfessor().getId() != currentUserId) {
                throw new EntityNotFoundException(RecommendationRequest.class, id);
            }
        return recommendationRequest;
    }

    /**
     * This method creates a new Recommendation Request. Accessible only to users with the role "ROLE_USER" so professors and students can both create.
     * @param professorId id from a dropdown of professors from the form in create page
     * @param recommendationType recommendation types of request
     * @param details details of request
     * @param dueDate submission date of request
     * @return the save recommendationrequests (with it's id field set by the database)
     */

    @Operation(summary = "Create a new recommendation request")
    @PreAuthorize("hasRole('ROLE_USER')")
    @PostMapping("/post")
    public RecommendationRequest postRecommendationRequests(
            @Parameter(name = "professorId") @RequestParam Long professorId,
            @Parameter(name = "recommendationType") @RequestParam String recommendationType,
            @Parameter(name = "details") @RequestParam String details,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dueDate)
            {
        //get current date right now and set status to pending
        CurrentUser currentUser = getCurrentUser();
        RecommendationRequest recommendationRequest = new RecommendationRequest();
        if (!recommendationType.equals("Other")) {
            requestTypeRepository.findByRequestType(recommendationType).orElseThrow(() -> new EntityNotFoundException(RequestType.class, recommendationType));
        }
        recommendationRequest.setRecommendationType(recommendationType);
        recommendationRequest.setDetails(details);
        User professor = userRepository.findById(professorId).orElseThrow(() -> new EntityNotFoundException(User.class, professorId));
        recommendationRequest.setProfessor(professor);
        recommendationRequest.setRequester(currentUser.getUser());
        recommendationRequest.setStatus("PENDING");
        recommendationRequest.setDueDate(dueDate);

        RecommendationRequest savedRecommendationRequest = recommendationRequestRepository.save(recommendationRequest);
        return savedRecommendationRequest;
    }

    /**
     * This method returns a list of recommendation requests with specified status for a professor.
     * @return a list of recommendation requests with specified status for a professor.
     */
    @Operation(summary = "Get all recommendation requests with specified status for a professor")
    @GetMapping("/professor/filtered")
    @PreAuthorize("hasRole('ROLE_PROFESSOR')")
    public Iterable<RecommendationRequest> getRecommendationRequestByStatusForProfessor(
        @RequestParam String status) {
        User currentUser = getCurrentUser().getUser();

        return recommendationRequestRepository.findAllByProfessorIdAndStatus(
            currentUser.getId(), status);
    }
}
