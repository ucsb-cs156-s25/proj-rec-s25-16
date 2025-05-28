package edu.ucsb.cs156.rec.controllers;

import edu.ucsb.cs156.rec.entities.User;
import edu.ucsb.cs156.rec.repositories.UserRepository;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Arrays;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;  
import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import org.springframework.test.web.servlet.MvcResult;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import edu.ucsb.cs156.rec.ControllerTestCase;
import edu.ucsb.cs156.rec.entities.RecommendationRequest;
import edu.ucsb.cs156.rec.entities.RequestType;
import edu.ucsb.cs156.rec.repositories.RecommendationRequestRepository;
import edu.ucsb.cs156.rec.repositories.RequestTypeRepository;
import edu.ucsb.cs156.rec.testconfig.TestConfig;

@WebMvcTest(controllers = RecommendationRequestController.class)
@Import(TestConfig.class)
public class RecommendationRequestControllerTest extends ControllerTestCase {
    @MockBean
    RecommendationRequestRepository recommendationRequestRepository;

    @MockBean
    UserRepository userRepository;
    
    @MockBean
    RequestTypeRepository requestTypeRepository;

    // Helper method to create mock RequestType
    private RequestType createMockRequestType(String typeName) {
        RequestType requestType = RequestType.builder()
            .id(1L)
            .requestType(typeName)
            .build();
        
        when(requestTypeRepository.findByRequestType(typeName)).thenReturn(Optional.of(requestType));
        when(requestTypeRepository.findById(1L)).thenReturn(Optional.of(requestType));
        
        return requestType;
    }

    //User can delete their own recommendation request
    @WithMockUser(roles = { "USER" })
    @Test
    public void  user_can_delete_their_recommendation_request() throws Exception {

        User user = currentUserService.getCurrentUser().getUser(); 
        User prof = User.builder()
                .id(22L)
                .email("profA@ucsb.edu")
                .googleSub("googleSub")
                .fullName("Prof A")
                .givenName("Prof")
                .familyName("A")
                .emailVerified(true)
                .professor(true)
                .build();

        RequestType requestType = createMockRequestType("PhDprogram");

        // arrange
        RecommendationRequest recReq = RecommendationRequest.builder()
                .id(15L)
                .requester(user)
                .professor(prof)
                .requestType(requestType)
                .details("details")
                .status("PENDING")
                .completionDate(LocalDateTime.parse("2022-01-03T00:00:00"))
                .dueDate(LocalDateTime.parse("2022-01-03T00:00:00"))
                .submissionDate(LocalDateTime.parse("2022-01-03T00:00:00"))
                .lastModifiedDate(LocalDateTime.parse("2022-01-03T00:00:00"))
                .build();

        when(recommendationRequestRepository.findByIdAndRequester(eq(15L), eq(user))).thenReturn(Optional.of(recReq));

        // act
        MvcResult response = mockMvc.perform(
                delete("/api/recommendationrequest?id=15")
                        .with(csrf()))
                .andExpect(status().isOk()).andReturn();

        // assert
        verify(recommendationRequestRepository, times(1)).findByIdAndRequester(15L, user);
        verify(recommendationRequestRepository, times(1)).delete(recReq);

        Map<String, Object> json = responseToJson(response);
        assertEquals("RecommendationRequest with id 15 deleted", json.get("message"));
    }
    
    //user attempts to delete a recommendation request that dne
    @WithMockUser(roles = { "USER"})
    @Test
    public void user_tries_to_delete_non_existant_recommendation_request_and_gets_right_error_message()
            throws Exception {
        // arrange
        User user1 = currentUserService.getCurrentUser().getUser(); 
        User user2 = User.builder().id(44).build(); 
        User prof = User.builder()
                .id(22L)
                .email("profA@ucsb.edu")
                .googleSub("googleSub")
                .fullName("Prof A")
                .givenName("Prof")
                .familyName("A")
                .emailVerified(true)
                .professor(true)
                .build();

        RequestType requestType = createMockRequestType("PhDprogram");

        RecommendationRequest rec1 = RecommendationRequest.builder()
                .id(15L)
                .requester(user1)
                .professor(prof)
                .requestType(requestType)
                .details("details")
                .status("PENDING")
                .completionDate(LocalDateTime.parse("2022-01-03T00:00:00"))
                .dueDate(LocalDateTime.parse("2022-01-03T00:00:00"))
                .submissionDate(LocalDateTime.parse("2022-01-03T00:00:00"))
                .lastModifiedDate(LocalDateTime.parse("2022-01-03T00:00:00"))
                .build();
                
        when(recommendationRequestRepository.findByIdAndRequester(eq(15L),eq(user2))).thenReturn(Optional.of(rec1));

        // act
        MvcResult response = mockMvc.perform(
                delete("/api/recommendationrequest?id=15")
                        .with(csrf()))
                .andExpect(status().isNotFound()).andReturn();

        // assert
        verify(recommendationRequestRepository, times(1)).findByIdAndRequester(15L, user1);
        Map<String, Object> json = responseToJson(response);
        assertEquals("RecommendationRequest with id 15 not found", json.get("message"));
    }

    //User can't delete another user's recommendation request
    @WithMockUser(roles = { "USER" })
    @Test
    public void user_can_not_delete_belonging_to_another_user()
        throws Exception {

        User user1 = currentUserService.getCurrentUser().getUser();
        User user2 = User.builder().id(44).build();
        User prof = User.builder()
                .id(22L)
                .email("profA@ucsb.edu")
                .googleSub("googleSub")
                .fullName("Prof A")
                .givenName("Prof")
                .familyName("A")
                .emailVerified(true)
                .professor(true)
                .build();
        
        RequestType requestType = createMockRequestType("PhDprogram");

        RecommendationRequest rec1 = RecommendationRequest.builder()
                .id(67L)
                .requester(user2)
                .professor(prof)
                .requestType(requestType)
                .details("details")
                .status("PENDING")
                .completionDate(LocalDateTime.parse("2022-01-03T00:00:00"))
                .dueDate(LocalDateTime.parse("2022-01-03T00:00:00"))
                .submissionDate(LocalDateTime.parse("2022-01-03T00:00:00"))
                .lastModifiedDate(LocalDateTime.parse("2022-01-03T00:00:00"))
                .build();

        when(recommendationRequestRepository.findById(eq(67L))).thenReturn(Optional.of(rec1));

        // act
        MvcResult response = mockMvc.perform(
                delete("/api/recommendationrequest?id=67")
                        .with(csrf()))
                .andExpect(status().isNotFound()).andReturn();

        // assert
        verify(recommendationRequestRepository, times(1)).findByIdAndRequester(67L, user1);
        Map<String, Object> json = responseToJson(response);
        assertEquals("RecommendationRequest with id 67 not found", json.get("message"));
    }

    //Admin can delete a recommendation request
    @WithMockUser(roles = { "ADMIN", "USER" })
    @Test
    public void admin_can_delete_recommendation_request() throws Exception {
        // arrange

        User user2 = User.builder().id(44).build(); 
        User prof = User.builder()
                .id(22L)
                .email("profA@ucsb.edu")
                .googleSub("googleSub")
                .fullName("Prof A")
                .givenName("Prof")
                .familyName("A")
                .emailVerified(true)
                .professor(true)
                .build();

        RequestType requestType = createMockRequestType("PhDprogram");

        RecommendationRequest rec1 = RecommendationRequest.builder()
                .id(67L)
                .requester(user2)
                .professor(prof)
                .requestType(requestType)
                .details("details")
                .status("PENDING")
                .completionDate(LocalDateTime.parse("2022-01-03T00:00:00"))
                .dueDate(LocalDateTime.parse("2022-01-03T00:00:00"))
                .submissionDate(LocalDateTime.parse("2022-01-03T00:00:00"))
                .lastModifiedDate(LocalDateTime.parse("2022-01-03T00:00:00"))
                .build();

        when(recommendationRequestRepository.findById(eq(67L))).thenReturn(Optional.of(rec1));
        // act
        MvcResult response = mockMvc.perform(
                delete("/api/recommendationrequest/admin?id=67")
                        .with(csrf()))
                .andExpect(status().isOk()).andReturn();

        // assert
        verify(recommendationRequestRepository, times(1)).findById(67L);
        verify(recommendationRequestRepository, times(1)).delete(any());
        Map<String, Object> json = responseToJson(response);
        assertEquals("RecommendationRequest with id 67 deleted", json.get("message"));

    }

    //Admin can't delete a recommendation request that dne
    @WithMockUser(roles = { "ADMIN", "USER" })
    @Test
    public void admin_can_not_delete_recommendation_request_that_does_not_exist() throws Exception {
        // arrange

        when(recommendationRequestRepository.findById(eq(19L))).thenReturn(Optional.empty()); 

        // act
        MvcResult response = mockMvc.perform(
                delete("/api/recommendationrequest/admin?id=19")
                        .with(csrf()))
                .andExpect(status().isNotFound()).andReturn();

        // assert
        verify(recommendationRequestRepository, times(1)).findById(19L);
        Map<String, Object> json = responseToJson(response);
        assertEquals("RecommendationRequest with id 19 not found", json.get("message"));
    }
    
    //User can update their recommendation request
    @WithMockUser(roles = { "USER" })
    @Test
    public void user_logged_in_put_recommendation_request() throws Exception {
        User user1 = currentUserService.getCurrentUser().getUser(); 
        
        User prof1 = User.builder()
                .id(22L)
                .email("profA@ucsb.edu")
                .googleSub("googleSub")
                .fullName("Prof A")
                .givenName("Prof")
                .familyName("A")
                .emailVerified(true)
                .professor(true)
                .build();

        RequestType requestType = createMockRequestType("PhDprogram");

        RecommendationRequest rec = RecommendationRequest.builder()
                .id(63L)
                .requester(user1)
                .professor(prof1)
                .requestType(requestType)
                .details("details")
                .status("PENDING")
                .completionDate(LocalDateTime.parse("2022-01-03T00:00:00"))
                .dueDate(LocalDateTime.parse("2022-01-03T00:00:00"))
                .submissionDate(LocalDateTime.parse("2022-01-03T00:00:00"))
                .lastModifiedDate(LocalDateTime.parse("2022-01-03T00:00:00"))
                .build();

        RecommendationRequest rec_updated = RecommendationRequest.builder()
                .id(63L)
                .requester(user1)
                .professor(prof1)
                .requestType(requestType)
                .details("more details")
                .status("PENDING")
                .completionDate(LocalDateTime.parse("2022-01-03T00:00:00"))
                .dueDate(LocalDateTime.parse("2022-01-03T00:00:00"))
                .submissionDate(LocalDateTime.parse("2022-01-03T00:00:00"))
                .lastModifiedDate(LocalDateTime.parse("2022-01-03T00:00:00"))
                .build();

        RecommendationRequest rec_corrected = RecommendationRequest.builder()
                .id(63L)
                .requester(user1)
                .professor(prof1)
                .requestType(requestType)
                .details("more details")
                .status("PENDING")
                .completionDate(LocalDateTime.parse("2022-01-03T00:00:00"))
                .dueDate(LocalDateTime.parse("2022-01-03T00:00:00"))
                .submissionDate(LocalDateTime.parse("2022-01-03T00:00:00"))
                .lastModifiedDate(LocalDateTime.parse("2022-01-03T00:00:00"))
                .build();
              
        
        String requestBody = mapper.writeValueAsString(rec_updated); 
        String expectedReturn = mapper.writeValueAsString(rec_corrected); 

        when(recommendationRequestRepository.findByIdAndRequester(eq(63L), eq(user1))).thenReturn(Optional.of(rec)); 

        // act
        MvcResult response = mockMvc
                .perform(put("/api/recommendationrequest?id=63")
                .contentType(MediaType.APPLICATION_JSON)
                .characterEncoding("utf-8")
                .content(requestBody)
                .with(csrf()))
                .andExpect(status().isOk())
                .andReturn();

        // assert
        verify(recommendationRequestRepository, times(1)).findByIdAndRequester(63L, user1);
        verify(recommendationRequestRepository, times(1))
                .save(rec_corrected); 
        String responseString = response.getResponse().getContentAsString();
        assertEquals(expectedReturn, responseString);
    }

    //User can't edit a recommendation request that dne
    @WithMockUser(roles = { "USER" })
    @Test
    public void user_can_not_put_recommendation_request_that_does_not_exist() throws Exception {

        User user1 = currentUserService.getCurrentUser().getUser(); 

        User prof = User.builder()
                .id(22L)
                .email("profA@ucsb.edu")
                .googleSub("googleSub")
                .fullName("Prof A")
                .givenName("Prof")
                .familyName("A")
                .emailVerified(true)
                .professor(true)
                .build();

        RequestType requestType = createMockRequestType("PhDprogram");

        RecommendationRequest rec = RecommendationRequest.builder()
                .id(67L)
                .requester(user1)
                .professor(prof)
                .requestType(requestType)
                .details("details")
                .status("PENDING")
                .completionDate(LocalDateTime.parse("2022-01-03T00:00:00"))
                .dueDate(LocalDateTime.parse("2022-01-03T00:00:00"))
                .submissionDate(LocalDateTime.parse("2022-01-03T00:00:00"))
                .lastModifiedDate(LocalDateTime.parse("2022-01-03T00:00:00"))
                .build();

        String requestBody = mapper.writeValueAsString(rec); 
        when(recommendationRequestRepository.findByIdAndRequester(eq(67L), eq(user1))).thenReturn(Optional.empty());

        // act
        MvcResult response = mockMvc
                .perform(put("/api/recommendationrequest?id=67")
                .contentType(MediaType.APPLICATION_JSON)
                .characterEncoding("utf-8")
                .content(requestBody)
                .with(csrf()))
                .andExpect(status().isNotFound())
                .andReturn();
        // assert
        verify(recommendationRequestRepository, times(1)).findByIdAndRequester(67L, user1);
        Map<String, Object> output = responseToJson(response);
        assertEquals("RecommendationRequest with id 67 not found", output.get("message"));
    }

    //User can't edit a recommendation request for another user
    @WithMockUser(roles = { "USER" })
    @Test
    public void user_can_not_put_recommendation_request_for_another_user() throws Exception {
        User user1 = currentUserService.getCurrentUser().getUser(); 
        User user2 = User.builder().id(44).build(); 

        User prof = User.builder()
                .id(22L)
                .email("profA@ucsb.edu")
                .googleSub("googleSub")
                .fullName("Prof A")
                .givenName("Prof")
                .familyName("A")
                .emailVerified(true)
                .professor(true)
                .build();
        
        RequestType requestType = createMockRequestType("PhDprogram");
        
        RecommendationRequest rec = RecommendationRequest.builder()
                .id(67L)
                .requester(user2)
                .professor(prof)
                .requestType(requestType)
                .details("details")
                .status("PENDING")
                .completionDate(LocalDateTime.parse("2022-01-03T00:00:00"))
                .dueDate(LocalDateTime.parse("2022-01-03T00:00:00"))
                .submissionDate(LocalDateTime.parse("2022-01-03T00:00:00"))
                .lastModifiedDate(LocalDateTime.parse("2022-01-03T00:00:00"))
                .build();
        RecommendationRequest rec_updated = RecommendationRequest.builder()
                .id(67L)
                .requester(user1)
                .professor(prof)
                .requestType(requestType)
                .details("more details")
                .status("PENDING")
                .completionDate(LocalDateTime.parse("2022-01-03T00:00:00"))
                .dueDate(LocalDateTime.parse("2022-01-03T00:00:00"))
                .submissionDate(LocalDateTime.parse("2022-01-03T00:00:00"))
                .lastModifiedDate(LocalDateTime.parse("2022-01-03T00:00:00"))
                .build();
        when(recommendationRequestRepository.findByIdAndRequester(eq(31L), eq(user2)))
        .thenReturn(Optional.of(rec));

        String requestBody = mapper.writeValueAsString(rec_updated);

         // act
        MvcResult response = mockMvc
                .perform(put("/api/recommendationrequest?id=67")
                .contentType(MediaType.APPLICATION_JSON)
                .characterEncoding("utf-8")
                .content(requestBody)
                .with(csrf()))
                .andExpect(status().isNotFound())
                .andReturn();

        
        // assert
        verify(recommendationRequestRepository, times(1)).findByIdAndRequester(67, user1);
        Map<String, Object> json = responseToJson(response);
        assertEquals("EntityNotFoundException", json.get("type"));
        assertEquals("RecommendationRequest with id 67 not found", json.get("message"));
    }

    //Prof can edit a Recommendation Request to COMPLETED (tests the true condition)
    @WithMockUser(roles = {"PROFESSOR"})
    @Test
    public void prof_can_put_recommendation_request_completed() throws Exception {
        //arrange
        User student = User.builder().id(99).build(); 
        User prof = User.builder()
                .id(22L)
                .email("profA@ucsb.edu")
                .googleSub("googleSub")
                .fullName("Prof A")
                .givenName("Prof")
                .familyName("A")
                .emailVerified(true)
                .professor(true)
                .build();

        RequestType requestType = createMockRequestType("PhDprogram");

        RecommendationRequest rec = RecommendationRequest.builder()
                .id(67L)
                .requester(student)
                .professor(prof)
                .requestType(requestType)
                .details("details")
                .status("PENDING")
                .completionDate(LocalDateTime.parse("2022-01-03T00:00:00"))
                .dueDate(LocalDateTime.parse("2022-01-03T00:00:00"))
                .submissionDate(LocalDateTime.parse("2022-01-03T00:00:00"))
                .lastModifiedDate(LocalDateTime.parse("2022-01-03T00:00:00"))
                .build();

        RecommendationRequest rec_updated = RecommendationRequest.builder()
                .id(67L)
                .requester(student)
                .professor(prof)
                .requestType(requestType)
                .details("details")
                .status("COMPLETED")
                .completionDate(LocalDateTime.parse("2022-01-03T00:00:00"))
                .dueDate(LocalDateTime.parse("2022-01-03T00:00:00"))
                .submissionDate(LocalDateTime.parse("2022-01-03T00:00:00"))
                .lastModifiedDate(LocalDateTime.parse("2022-01-03T00:00:00"))
                .build();

        String requestBody = mapper.writeValueAsString(rec_updated);

        when(recommendationRequestRepository.findById(eq(67L))).thenReturn(Optional.of(rec)); 

        //act
        MvcResult response = mockMvc
                .perform(put("/api/recommendationrequest/professor?id=67")
                .contentType(MediaType.APPLICATION_JSON)
                .characterEncoding("utf-8")
                .content(requestBody)
                .with(csrf()))
                .andExpect(status().isOk())
                .andReturn();

        //assert
        verify(recommendationRequestRepository, times(1)).findById(67L);
        verify(recommendationRequestRepository, times(1)).save(any(RecommendationRequest.class));

        String responseString = response.getResponse().getContentAsString();
        RecommendationRequest responseObject = mapper.readValue(responseString, RecommendationRequest.class);
        
        // Verify that the completion date was set to approximately now (within 5 seconds)
        assertEquals("COMPLETED", responseObject.getStatus());
        assertEquals("details", responseObject.getDetails());
        assertEquals(67L, responseObject.getId());
        
        // Check that completion date is recent (within the last 5 seconds)
        LocalDateTime now = LocalDateTime.now();
        Duration timeDiff = Duration.between(responseObject.getCompletionDate(), now).abs();
        assertTrue(timeDiff.getSeconds() < 5, "Completion date should be set to current time");
    }

    //Prof can edit a Recommendation Request to PENDING (tests the false condition - negated conditional)
@WithMockUser(roles = {"PROFESSOR"})
@Test
public void prof_can_put_recommendation_request_pending_completion_date_unchanged() throws Exception {
    //arrange
    User student = User.builder().id(99).build(); 
    User prof = User.builder()
            .id(22L)
            .email("profA@ucsb.edu")
            .googleSub("googleSub")
            .fullName("Prof A")
            .givenName("Prof")
            .familyName("A")
            .emailVerified(true)
            .professor(true)
            .build();

    RequestType requestType = createMockRequestType("PhDprogram");

    LocalDateTime originalCompletionDate = LocalDateTime.parse("2022-01-03T00:00:00");

    RecommendationRequest rec = RecommendationRequest.builder()
            .id(67L)
            .requester(student)
            .professor(prof)
            .requestType(requestType)
            .details("details")
            .status("PENDING")
            .completionDate(originalCompletionDate)
            .dueDate(LocalDateTime.parse("2022-01-03T00:00:00"))
            .submissionDate(LocalDateTime.parse("2022-01-03T00:00:00"))
            .lastModifiedDate(LocalDateTime.parse("2022-01-03T00:00:00"))
            .build();

    RecommendationRequest rec_updated = RecommendationRequest.builder()
            .id(67L)
            .requester(student)
            .professor(prof)
            .requestType(requestType)
            .details("updated details")  // Changed details but keep status as PENDING
            .status("PENDING")  // Status stays PENDING - this should make the condition FALSE
            .completionDate(originalCompletionDate)
            .dueDate(LocalDateTime.parse("2022-01-03T00:00:00"))
            .submissionDate(LocalDateTime.parse("2022-01-03T00:00:00"))
            .lastModifiedDate(LocalDateTime.parse("2022-01-03T00:00:00"))
            .build();

    String requestBody = mapper.writeValueAsString(rec_updated);

    when(recommendationRequestRepository.findById(eq(67L))).thenReturn(Optional.of(rec)); 

    // REMOVE THIS LINE - don't mock the save method, let it work naturally
    // when(recommendationRequestRepository.save(any(RecommendationRequest.class))).thenReturn(rec_updated);

    //act
    MvcResult response = mockMvc
            .perform(put("/api/recommendationrequest/professor?id=67")
            .contentType(MediaType.APPLICATION_JSON)
            .characterEncoding("utf-8")
            .content(requestBody)
            .with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    //assert
    verify(recommendationRequestRepository, times(1)).findById(67L);
    verify(recommendationRequestRepository, times(1)).save(any(RecommendationRequest.class));

    String responseString = response.getResponse().getContentAsString();
    RecommendationRequest responseObject = mapper.readValue(responseString, RecommendationRequest.class);
    
    // Verify that the completion date did NOT change (since status is PENDING - condition was FALSE)
    assertEquals("PENDING", responseObject.getStatus());
    assertEquals("updated details", responseObject.getDetails());
    assertEquals(67L, responseObject.getId());
    assertEquals(originalCompletionDate, responseObject.getCompletionDate());
}

    @WithMockUser(roles = {"PROFESSOR"})
    @Test
    public void prof_can_put_recommendation_request_from_completed_to_denied() throws Exception {
    // This test specifically targets the second part of the OR condition
    User student = User.builder().id(99).build(); 
    User prof = User.builder()
            .id(22L)
            .email("profA@ucsb.edu")
            .googleSub("googleSub")
            .fullName("Prof A")
            .givenName("Prof")
            .familyName("A")
            .emailVerified(true)
            .professor(true)
            .build();

    RequestType requestType = createMockRequestType("PhDprogram");

    RecommendationRequest rec = RecommendationRequest.builder()
            .id(67L)
            .requester(student)
            .professor(prof)
            .requestType(requestType)
            .details("details")
            .status("COMPLETED")  // Start with COMPLETED
            .completionDate(LocalDateTime.parse("2022-01-03T00:00:00"))
            .dueDate(LocalDateTime.parse("2022-01-03T00:00:00"))
            .submissionDate(LocalDateTime.parse("2022-01-03T00:00:00"))
            .lastModifiedDate(LocalDateTime.parse("2022-01-03T00:00:00"))
            .build();

    RecommendationRequest rec_updated = RecommendationRequest.builder()
            .id(67L)
            .requester(student)
            .professor(prof)
            .requestType(requestType)
            .details("details")
            .status("DENIED")  // Change to DENIED
            .completionDate(LocalDateTime.parse("2022-01-03T00:00:00"))
            .dueDate(LocalDateTime.parse("2022-01-03T00:00:00"))
            .submissionDate(LocalDateTime.parse("2022-01-03T00:00:00"))
            .lastModifiedDate(LocalDateTime.parse("2022-01-03T00:00:00"))
            .build();

    String requestBody = mapper.writeValueAsString(rec_updated);

    when(recommendationRequestRepository.findById(eq(67L))).thenReturn(Optional.of(rec)); 

    //act
    MvcResult response = mockMvc
            .perform(put("/api/recommendationrequest/professor?id=67")
            .contentType(MediaType.APPLICATION_JSON)
            .characterEncoding("utf-8")
            .content(requestBody)
            .with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    //assert
    verify(recommendationRequestRepository, times(1)).findById(67L);
    verify(recommendationRequestRepository, times(1)).save(any(RecommendationRequest.class));

    String responseString = response.getResponse().getContentAsString();
    RecommendationRequest responseObject = mapper.readValue(responseString, RecommendationRequest.class);
    
    assertEquals("DENIED", responseObject.getStatus());
    assertEquals(67L, responseObject.getId());
    
    // Check that completion date is recent (within the last 5 seconds)
    LocalDateTime now = LocalDateTime.now();
    Duration timeDiff = Duration.between(responseObject.getCompletionDate(), now).abs();
    assertTrue(timeDiff.getSeconds() < 5, "Completion date should be set to current time");
}

        // Simple test to hit the negated conditional (false branch)
@WithMockUser(roles = {"PROFESSOR"})
@Test
public void prof_can_put_recommendation_request_status_other_than_completed_or_denied() throws Exception {
    //arrange
    User student = User.builder().id(99).build(); 
    User prof = User.builder()
            .id(22L)
            .email("profA@ucsb.edu")
            .googleSub("googleSub")
            .fullName("Prof A")
            .givenName("Prof")
            .familyName("A")
            .emailVerified(true)
            .professor(true)
            .build();

    RequestType requestType = createMockRequestType("PhDprogram");

    LocalDateTime originalCompletionDate = LocalDateTime.parse("2022-01-03T00:00:00");

    RecommendationRequest rec = RecommendationRequest.builder()
            .id(67L)
            .requester(student)
            .professor(prof)
            .requestType(requestType)
            .details("details")
            .status("COMPLETED")
            .completionDate(originalCompletionDate)
            .dueDate(LocalDateTime.parse("2022-01-03T00:00:00"))
            .submissionDate(LocalDateTime.parse("2022-01-03T00:00:00"))
            .lastModifiedDate(LocalDateTime.parse("2022-01-03T00:00:00"))
            .build();

    RecommendationRequest rec_updated = RecommendationRequest.builder()
            .id(67L)
            .requester(student)
            .professor(prof)
            .requestType(requestType)
            .details("updated details")
            .status("PENDING")  // This should make the condition FALSE
            .completionDate(originalCompletionDate)
            .dueDate(LocalDateTime.parse("2022-01-03T00:00:00"))
            .submissionDate(LocalDateTime.parse("2022-01-03T00:00:00"))
            .lastModifiedDate(LocalDateTime.parse("2022-01-03T00:00:00"))
            .build();

    String requestBody = mapper.writeValueAsString(rec_updated);

    when(recommendationRequestRepository.findById(eq(67L))).thenReturn(Optional.of(rec)); 

    //act
    MvcResult response = mockMvc
            .perform(put("/api/recommendationrequest/professor?id=67")
            .contentType(MediaType.APPLICATION_JSON)
            .characterEncoding("utf-8")
            .content(requestBody)
            .with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    //assert
    verify(recommendationRequestRepository, times(1)).findById(67L);
    verify(recommendationRequestRepository, times(1)).save(any(RecommendationRequest.class));

    String responseString = response.getResponse().getContentAsString();
    RecommendationRequest responseObject = mapper.readValue(responseString, RecommendationRequest.class);
    
    // The completion date should NOT be updated since status is PENDING
    assertEquals("PENDING", responseObject.getStatus());
    assertEquals("updated details", responseObject.getDetails());
    assertEquals(67L, responseObject.getId());
    // The completion date should remain the original date, not be updated to now
    assertEquals(originalCompletionDate, responseObject.getCompletionDate());
}
    //Prof can edit a Recommendation Request to DENIED (tests the true condition for DENIED)
    @WithMockUser(roles = {"PROFESSOR"})
    @Test
    public void prof_can_put_recommendation_request_denied() throws Exception {
        //arrange
        User student = User.builder().id(99).build(); 
        User prof = User.builder()
                .id(22L)
                .email("profA@ucsb.edu")
                .googleSub("googleSub")
                .fullName("Prof A")
                .givenName("Prof")
                .familyName("A")
                .emailVerified(true)
                .professor(true)
                .build();

        RequestType requestType = createMockRequestType("PhDprogram");

        RecommendationRequest rec = RecommendationRequest.builder()
                .id(67L)
                .requester(student)
                .professor(prof)
                .requestType(requestType)
                .details("details")
                .status("PENDING")
                .completionDate(LocalDateTime.parse("2022-01-03T00:00:00"))
                .dueDate(LocalDateTime.parse("2022-01-03T00:00:00"))
                .submissionDate(LocalDateTime.parse("2022-01-03T00:00:00"))
                .lastModifiedDate(LocalDateTime.parse("2022-01-03T00:00:00"))
                .build();

        RecommendationRequest rec_updated = RecommendationRequest.builder()
                .id(67L)
                .requester(student)
                .professor(prof)
                .requestType(requestType)
                .details("details")
                .status("DENIED")  // Status changes to DENIED
                .completionDate(LocalDateTime.parse("2022-01-03T00:00:00"))
                .dueDate(LocalDateTime.parse("2022-01-03T00:00:00"))
                .submissionDate(LocalDateTime.parse("2022-01-03T00:00:00"))
                .lastModifiedDate(LocalDateTime.parse("2022-01-03T00:00:00"))
                .build();

        String requestBody = mapper.writeValueAsString(rec_updated);

        when(recommendationRequestRepository.findById(eq(67L))).thenReturn(Optional.of(rec)); 

        //act
        MvcResult response = mockMvc
                .perform(put("/api/recommendationrequest/professor?id=67")
                .contentType(MediaType.APPLICATION_JSON)
                .characterEncoding("utf-8")
                .content(requestBody)
                .with(csrf()))
                .andExpect(status().isOk())
                .andReturn();

        //assert
        verify(recommendationRequestRepository, times(1)).findById(67L);
        verify(recommendationRequestRepository, times(1)).save(any(RecommendationRequest.class));

        String responseString = response.getResponse().getContentAsString();
        RecommendationRequest responseObject = mapper.readValue(responseString, RecommendationRequest.class);
        
        // Verify that the completion date was set to approximately now (within 5 seconds)
        assertEquals("DENIED", responseObject.getStatus());
        assertEquals("details", responseObject.getDetails());
        assertEquals(67L, responseObject.getId());
        
        // Check that completion date is recent (within the last 5 seconds)
        LocalDateTime now = LocalDateTime.now();
        Duration timeDiff = Duration.between(responseObject.getCompletionDate(), now).abs();
        assertTrue(timeDiff.getSeconds() < 5, "Completion date should be set to current time");
    }

    //prof can not edit a Recommendation Request that dne
    @WithMockUser(roles = {"PROFESSOR"})
    @Test
    public void prof_can_not_put_recommendation_request_that_does_not_exist() throws Exception {
        //arrange
        User user2 = User.builder().id(200).build(); 

        User prof = User.builder()
                .id(22L)
                .email("profA@ucsb.edu")
                .googleSub("googleSub")
                .fullName("Prof A")
                .givenName("Prof")
                .familyName("A")
                .emailVerified(true)
                .professor(true)
                .build();

        RequestType requestType = createMockRequestType("PhDprogram");

        RecommendationRequest rec_updated = RecommendationRequest.builder()
                .id(67L)
                .requester(user2)
                .professor(prof)
                .requestType(requestType)
                .details("details")
                .status("COMPLETED")
                .completionDate(LocalDateTime.parse("2022-01-03T00:00:00"))
                .dueDate(LocalDateTime.parse("2022-01-03T00:00:00"))
                .submissionDate(LocalDateTime.parse("2022-01-03T00:00:00"))
                .lastModifiedDate(LocalDateTime.parse("2022-01-03T00:00:00"))
                .build();

        String requestBody = mapper.writeValueAsString(rec_updated);

        when(recommendationRequestRepository.findById(eq(67L))).thenReturn(Optional.empty());

        //act 
        MvcResult response = mockMvc
                .perform(put("/api/recommendationrequest/professor?id=67")
                .contentType(MediaType.APPLICATION_JSON)
                .characterEncoding("utf-8")
                .content(requestBody)
                .with(csrf()))
                .andExpect(status().isNotFound())
                .andReturn();
        
        //assert
        verify(recommendationRequestRepository, times(1)).findById(67L);
        Map<String, Object> json = responseToJson(response);
        assertEquals("EntityNotFoundException", json.get("type"));
        assertEquals("RecommendationRequest with id 67 not found", json.get("message"));
    }

    @WithMockUser(roles = {"ADMIN", "USER"})
    @Test
    public void admin_can_get_all_recommendation_requests() throws Exception {

        User user1 = User.builder().id(1).build();
        User user2 = User.builder().id(2).build();
        User prof1 = User.builder().id(3).build();
        User prof2 = User.builder().id(4).build();
        
        RequestType requestType1 = createMockRequestType("PhDprogram");
        RequestType requestType2 = createMockRequestType("JobApplication");

        RecommendationRequest recA = RecommendationRequest.builder()
                .id(15L)
                .requester(user1)
                .professor(prof1)
                .requestType(requestType1)
                .details("details1")
                .status("pending")
                .completionDate(LocalDateTime.parse("2022-01-03T00:00:00"))
                .dueDate(LocalDateTime.parse("2022-01-03T00:00:00"))
                .submissionDate(LocalDateTime.parse("2022-01-03T00:00:00"))
                .lastModifiedDate(LocalDateTime.parse("2022-01-03T00:00:00"))
                .build();

        RecommendationRequest recB = RecommendationRequest.builder()
                .id(16L)
                .requester(user1)
                .professor(prof2)
                .requestType(requestType2)
               .details("details2")
               .status("pending")
               .completionDate(LocalDateTime.parse("2022-01-03T00:00:00"))
               .dueDate(LocalDateTime.parse("2022-01-03T00:00:00"))
               .submissionDate(LocalDateTime.parse("2022-01-03T00:00:00"))
               .lastModifiedDate(LocalDateTime.parse("2022-01-03T00:00:00"))
               .build();

       RecommendationRequest recC = RecommendationRequest.builder()
               .id(17L)
               .requester(user2)
               .professor(prof1)
               .requestType(requestType1)
               .details("details3")
               .status("pending")
               .completionDate(LocalDateTime.parse("2022-01-03T00:00:00"))
               .dueDate(LocalDateTime.parse("2022-01-03T00:00:00"))
               .submissionDate(LocalDateTime.parse("2022-01-03T00:00:00"))
               .lastModifiedDate(LocalDateTime.parse("2022-01-03T00:00:00"))
               .build();

       ArrayList<RecommendationRequest> expectedRecommendations = new ArrayList<>();
       expectedRecommendations.addAll(Arrays.asList(recA, recB, recC));

       when(recommendationRequestRepository.findAll()).thenReturn(expectedRecommendations);

       // act
       MvcResult response = mockMvc.perform(get("/api/recommendationrequest/admin/all"))
               .andExpect(status().isOk()).andReturn();

       // assert
       verify(recommendationRequestRepository, times(1)).findAll();
       String expectedJson = mapper.writeValueAsString(expectedRecommendations);
       String responseString = response.getResponse().getContentAsString();
       assertEquals(expectedJson, responseString);
   }

   @WithMockUser(roles = { "USER" })
   @Test
   public void logged_in_user_can_get_all_their_own_recommendation_requests() throws Exception {

       // arrange
       User currentUser = currentUserService.getCurrentUser().getUser();
       User user1 = currentUser;
       User profX = User.builder().id(999).build();
       User profY = User.builder().id(1000).build();
       
       RequestType requestType1 = createMockRequestType("PhDprogram");
       RequestType requestType2 = createMockRequestType("JobApplication");

       RecommendationRequest recA = RecommendationRequest.builder()
               .id(15L)
               .requester(user1)
               .professor(profX)
               .requestType(requestType1)
               .details("details")
               .status("pending")
               .completionDate(LocalDateTime.parse("2022-01-03T00:00:00"))
               .dueDate(LocalDateTime.parse("2022-01-03T00:00:00"))
               .submissionDate(LocalDateTime.parse("2022-01-03T00:00:00"))
               .lastModifiedDate(LocalDateTime.parse("2022-01-03T00:00:00"))
               .build();

       RecommendationRequest recB = RecommendationRequest.builder()
               .id(16L)
               .requester(user1)
               .professor(profY)
               .requestType(requestType2)
               .details("details2")
               .status("pending")
               .completionDate(LocalDateTime.parse("2022-01-03T00:00:00"))
               .dueDate(LocalDateTime.parse("2022-01-03T00:00:00"))
               .submissionDate(LocalDateTime.parse("2022-01-03T00:00:00"))
               .lastModifiedDate(LocalDateTime.parse("2022-01-03T00:00:00"))
               .build();

       RecommendationRequest recC = RecommendationRequest.builder()
               .id(17L)
               .requester(user1)
               .professor(profX)
               .requestType(requestType1)
               .details("details3")
               .status("pending")
               .completionDate(LocalDateTime.parse("2022-01-03T00:00:00"))
               .dueDate(LocalDateTime.parse("2022-01-03T00:00:00"))
               .submissionDate(LocalDateTime.parse("2022-01-03T00:00:00"))
               .lastModifiedDate(LocalDateTime.parse("2022-01-03T00:00:00"))
               .build();

       ArrayList<RecommendationRequest> expectedRequests = new ArrayList<>();
       expectedRequests.addAll(Arrays.asList(recA, recB, recC));

       when(recommendationRequestRepository.findAllByRequesterId(eq(user1.getId()))).thenReturn(expectedRequests);

       // act
       MvcResult response = mockMvc.perform(get("/api/recommendationrequest/requester/all"))
               .andExpect(status().isOk()).andReturn();

       // assert
       verify(recommendationRequestRepository, times(1)).findAllByRequesterId(eq(user1.getId()));
       String expectedJson = mapper.writeValueAsString(expectedRequests);
       String responseString = response.getResponse().getContentAsString();
       assertEquals(expectedJson, responseString);
   }

   @WithMockUser(roles = { "PROFESSOR" })
   @Test
   public void professor_can_get_all_recommendation_requests_for_them() throws Exception {

       // arrange
       User currentUser = currentUserService.getCurrentUser().getUser();
       User prof = currentUser;
       User studentX = User.builder().id(999).build();
       User studentY = User.builder().id(1000).build();
       
       RequestType requestType1 = createMockRequestType("PhDprogram");
       RequestType requestType2 = createMockRequestType("JobApplication");

       RecommendationRequest recA = RecommendationRequest.builder()
               .id(15L)
               .requester(studentX)
               .professor(prof)
               .requestType(requestType1)
               .details("details")
               .status("pending")
               .completionDate(LocalDateTime.parse("2022-01-03T00:00:00"))
               .dueDate(LocalDateTime.parse("2022-01-03T00:00:00"))
               .submissionDate(LocalDateTime.parse("2022-01-03T00:00:00"))
               .lastModifiedDate(LocalDateTime.parse("2022-01-03T00:00:00"))
               .build();

       RecommendationRequest recB = RecommendationRequest.builder()
               .id(16L)
               .requester(studentY)
               .professor(prof)
               .requestType(requestType2)
               .details("details2")
               .status("pending")
               .completionDate(LocalDateTime.parse("2022-01-03T00:00:00"))
               .dueDate(LocalDateTime.parse("2022-01-03T00:00:00"))
               .submissionDate(LocalDateTime.parse("2022-01-03T00:00:00"))
               .lastModifiedDate(LocalDateTime.parse("2022-01-03T00:00:00"))
               .build();

       RecommendationRequest recC = RecommendationRequest.builder()
               .id(17L)
               .requester(studentX)
               .professor(prof)
               .requestType(requestType1)
               .details("details3")
               .status("pending")
               .completionDate(LocalDateTime.parse("2022-01-03T00:00:00"))
               .dueDate(LocalDateTime.parse("2022-01-03T00:00:00"))
               .submissionDate(LocalDateTime.parse("2022-01-03T00:00:00"))
               .lastModifiedDate(LocalDateTime.parse("2022-01-03T00:00:00"))
               .build();

       ArrayList<RecommendationRequest> expectedRequests = new ArrayList<>();
       expectedRequests.addAll(Arrays.asList(recA, recB, recC));

       when(recommendationRequestRepository.findAllByProfessorId(eq(prof.getId()))).thenReturn(expectedRequests);

       // act
       MvcResult response = mockMvc.perform(get("/api/recommendationrequest/professor/all"))
               .andExpect(status().isOk()).andReturn();

       // assert
       verify(recommendationRequestRepository, times(1)).findAllByProfessorId(eq(prof.getId()));
       String expectedJson = mapper.writeValueAsString(expectedRequests);
       String responseString = response.getResponse().getContentAsString();
       assertEquals(expectedJson, responseString);
   }

   @WithMockUser(roles = { "PROFESSOR" })
   @Test
   public void professor_can_get_recommendation_request_by_status() throws Exception {
       // arrange
       User currentUser = currentUserService.getCurrentUser().getUser();
       User prof = currentUser;
       User studentX = User.builder().id(999).build();
       User studentY = User.builder().id(1000).build();
       
       RequestType requestType1 = createMockRequestType("PhDprogram");
       RequestType requestType2 = createMockRequestType("JobApplication");

       RecommendationRequest recA = RecommendationRequest.builder()
               .id(15L)
               .requester(studentX)
               .professor(prof)
               .requestType(requestType1)
               .details("details")
               .status("PENDING")
               .completionDate(LocalDateTime.parse("2022-01-03T00:00:00"))
               .dueDate(LocalDateTime.parse("2022-01-03T00:00:00"))
               .submissionDate(LocalDateTime.parse("2022-01-03T00:00:00"))
               .lastModifiedDate(LocalDateTime.parse("2022-01-03T00:00:00"))
               .build();

       RecommendationRequest recB = RecommendationRequest.builder()
               .id(16L)
               .requester(studentY)
               .professor(prof)
               .requestType(requestType2)
               .details("details2")
               .status("PENDING")
               .completionDate(LocalDateTime.parse("2022-01-03T00:00:00"))
               .dueDate(LocalDateTime.parse("2022-01-03T00:00:00"))
               .submissionDate(LocalDateTime.parse("2022-01-03T00:00:00"))
               .lastModifiedDate(LocalDateTime.parse("2022-01-03T00:00:00"))
               .build();

       ArrayList<RecommendationRequest> expectedRequests = new ArrayList<>();
       expectedRequests.addAll(Arrays.asList(recA, recB));

       when(recommendationRequestRepository.findAllByProfessorIdAndStatus(eq(prof.getId()), eq("PENDING"))).thenReturn(expectedRequests);

       // act
       MvcResult response = mockMvc.perform(
               get("/api/recommendationrequest/professor/filtered?status=PENDING"))
               .andExpect(status().isOk()).andReturn();

       // assert
       verify(recommendationRequestRepository, times(1)).findAllByProfessorIdAndStatus(eq(prof.getId()), eq("PENDING"));
       String expectedJson = mapper.writeValueAsString(expectedRequests);
       String responseString = response.getResponse().getContentAsString();
       assertEquals(expectedJson, responseString);
   }

   @WithMockUser(roles = { "PROFESSOR" })
   @Test
   public void professor_get_recommendation_request_by_status_empty_list() throws Exception {
       // arrange
       User currentUser = currentUserService.getCurrentUser().getUser();
       User prof = currentUser;

       ArrayList<RecommendationRequest> expectedRequests = new ArrayList<>();

       when(recommendationRequestRepository.findAllByProfessorIdAndStatus(eq(prof.getId()), eq("COMPLETED"))).thenReturn(expectedRequests);

       // act
       MvcResult response = mockMvc.perform(
               get("/api/recommendationrequest/professor/filtered?status=COMPLETED"))
               .andExpect(status().isOk()).andReturn();

       // assert
       verify(recommendationRequestRepository, times(1)).findAllByProfessorIdAndStatus(eq(prof.getId()), eq("COMPLETED"));
       String expectedJson = mapper.writeValueAsString(expectedRequests);
       String responseString = response.getResponse().getContentAsString();
       assertEquals(expectedJson, responseString);
   }

   @WithMockUser(roles = { "USER" })
   @Test
   public void non_professor_get_recommendation_request_by_status_access_denied() throws Exception {
       // act
       MvcResult response = mockMvc.perform(
               get("/api/recommendationrequest/professor/filtered?status=PENDING"))
               .andExpect(status().isForbidden()).andReturn();
   }

   @WithMockUser(roles = { "USER" })
@Test
public void test_that_a_user_can_post_a_new_recommendation_request() throws Exception {
    // arrange
    User user1 = currentUserService.getCurrentUser().getUser();
    User prof = User.builder()
            .id(7L)
            .email("professor@ucsb.edu")
            .googleSub("googleSub")
            .fullName("Professor Person")
            .givenName("Professor")
            .familyName("Person")
            .emailVerified(true)
            .professor(true)
            .build();
    
    RequestType requestType = createMockRequestType("PhDprogram");

    RecommendationRequest expectedRequest = RecommendationRequest.builder()
            .requester(user1)
            .professor(prof)
            .requestType(requestType)
            .details("test details")
            .status("PENDING")
            .dueDate(LocalDateTime.parse("2024-11-25T16:46:28"))
            .build();

    when(userRepository.findById(eq(7L))).thenReturn(Optional.of(prof));
    when(requestTypeRepository.findById(eq(1L))).thenReturn(Optional.of(requestType));
    
    // ADD THIS LINE - Mock the save method to return the expected request
    when(recommendationRequestRepository.save(any(RecommendationRequest.class))).thenReturn(expectedRequest);

    // act
    MvcResult response = mockMvc.perform(
            post("/api/recommendationrequest/post")
                    .param("requestType_id", "1")
                    .param("details", "test details")
                    .param("professorId", "7")
                    .param("dueDate", "2024-11-25T16:46:28")
                    .with(csrf()))
            .andExpect(status().isOk()).andReturn();

    // assert
    verify(recommendationRequestRepository, times(1)).save(any(RecommendationRequest.class));
    String expectedJson = mapper.writeValueAsString(expectedRequest);
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);
=======
    @WithMockUser(roles = { "ADMIN" })
    @Test
    public void admin_can_get_all_recommendation_requests() throws Exception {
        User requester  = User.builder().id(1L).email("requester@example.com").build();
        User professor  = User.builder().id(2L).email("professor@example.com").build();

        RecommendationRequest rec1 = RecommendationRequest.builder()
                .id(22L)
                .requester(requester)
                .professor(professor)
                .recommendationType("PhDprogram")
                .details("Details for rec1")
                .status("PENDING")
                .completionDate(null)
                .dueDate(LocalDateTime.parse("2025-06-01T00:00:00"))
                .submissionDate(LocalDateTime.parse("2025-05-01T00:00:00"))
                .lastModifiedDate(LocalDateTime.parse("2025-05-15T00:00:00"))
                .build();

        RecommendationRequest rec2 = RecommendationRequest.builder()
                .id(67L)
                .requester(requester)
                .professor(professor)
                .recommendationType("Internship")
                .details("Details for rec2")
                .status("COMPLETED")
                .completionDate(LocalDateTime.parse("2025-05-20T00:00:00"))
                .dueDate(LocalDateTime.parse("2025-06-15T00:00:00"))
                .submissionDate(LocalDateTime.parse("2025-05-05T00:00:00"))
                .lastModifiedDate(LocalDateTime.parse("2025-05-20T00:00:00"))
                .build();

        List<RecommendationRequest> mockRequests = Arrays.asList(rec1, rec2);
        when(recommendationRequestRepository.findAll()).thenReturn(mockRequests);

        MvcResult response = mockMvc.perform(
                get("/api/recommendationrequest/admin/all")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andReturn();

        // assert
        verify(recommendationRequestRepository, times(1)).findAll();

        String expectedJson = mapper.writeValueAsString(mockRequests);
        String responseString = response.getResponse().getContentAsString();
        assertEquals(expectedJson, responseString);
    }
}

   @WithMockUser(roles = { "USER" })
   @Test
   public void test_post_recommendation_request_with_existing_professor_and_existing_other_type() throws Exception {
       // arrange
       User currentUser = currentUserService.getCurrentUser().getUser();
       User professor = User.builder().id(7L).email("prof@ucsb.edu").fullName("Professor").build();
       
       // Create mock "Other" type that already exists
       RequestType otherType = RequestType.builder().id(99L).requestType("Other").build();
       
       // Mock the request type repository to return the Other type
       when(requestTypeRepository.findByRequestType("Other")).thenReturn(Optional.of(otherType));
       
       // Create expected recommendation request
       RecommendationRequest expectedRequest = RecommendationRequest.builder()
               .requester(currentUser)
               .professor(professor)
               .requestType(otherType)
               .details("test details")
               .status("PENDING")
               .dueDate(LocalDateTime.parse("2024-11-25T16:46:28"))
               .build();
       
       // Mock save to return our expected request
       when(recommendationRequestRepository.save(any(RecommendationRequest.class))).thenReturn(expectedRequest);
       when(userRepository.findById(7L)).thenReturn(Optional.of(professor));
       
       // act
       MvcResult response = mockMvc.perform(
               post("/api/recommendationrequest/post")
               .param("requestType_id", "OTHER")  // Use the special "OTHER" value
               .param("details", "test details")
               .param("professorId", "7")
               .param("dueDate", "2024-11-25T16:46:28")
               .with(csrf()))
               .andExpect(status().isOk())
               .andReturn();
       
       // assert
       verify(requestTypeRepository, times(1)).findByRequestType("Other");
       verify(recommendationRequestRepository, times(1)).save(any(RecommendationRequest.class));
       
       String expectedJson = mapper.writeValueAsString(expectedRequest);
       String responseString = response.getResponse().getContentAsString();
       assertEquals(expectedJson, responseString);
   }
   
   @WithMockUser(roles = { "USER" })
   @Test
   public void test_post_recommendation_request_with_existing_professor_and_non_existing_other_type() throws Exception {
       // arrange
       User currentUser = currentUserService.getCurrentUser().getUser();
       User professor = User.builder().id(7L).email("prof@ucsb.edu").fullName("Professor").build();
       
       // Create a new Other type that will be created
       RequestType newOtherType = RequestType.builder().id(99L).requestType("Other").build();
       
       // Mock the request type repository to NOT find the Other type, but then save it
       when(requestTypeRepository.findByRequestType("Other")).thenReturn(Optional.empty());
       when(requestTypeRepository.save(any(RequestType.class))).thenReturn(newOtherType);
       
       // Create expected recommendation request
       RecommendationRequest expectedRequest = RecommendationRequest.builder()
               .requester(currentUser)
               .professor(professor)
               .requestType(newOtherType)
               .details("test details")
               .status("PENDING")
               .dueDate(LocalDateTime.parse("2024-11-25T16:46:28"))
               .build();
       
       // Mock save to return our expected request
       when(recommendationRequestRepository.save(any(RecommendationRequest.class))).thenReturn(expectedRequest);
       when(userRepository.findById(7L)).thenReturn(Optional.of(professor));
       
       // act
       MvcResult response = mockMvc.perform(
               post("/api/recommendationrequest/post")
               .param("requestType_id", "OTHER")  // Use the special "OTHER" value
               .param("details", "test details")
               .param("professorId", "7")
               .param("dueDate", "2024-11-25T16:46:28")
               .with(csrf()))
               .andExpect(status().isOk())
               .andReturn();
       
       // assert
       verify(requestTypeRepository, times(1)).findByRequestType("Other");
       verify(requestTypeRepository, times(1)).save(any(RequestType.class));
       verify(recommendationRequestRepository, times(1)).save(any(RecommendationRequest.class));
       
       String expectedJson = mapper.writeValueAsString(expectedRequest);
       String responseString = response.getResponse().getContentAsString();
       assertEquals(expectedJson, responseString);
   }
   
   @WithMockUser(roles = { "USER" })
   @Test
   public void test_post_recommendation_request_with_invalid_request_type_format() throws Exception {
       // act
       MvcResult response = mockMvc.perform(
               post("/api/recommendationrequest/post")
               .param("requestType_id", "invalid-id")  // Non-numeric, non-special value
               .param("details", "test details")
               .param("professorId", "7")
               .param("dueDate", "2024-11-25T16:46:28")
               .with(csrf()))
               .andExpect(status().isBadRequest())  // Should return 400 Bad Request
               .andReturn();
       
       // assert
       Map<String, Object> json = responseToJson(response);
       assertEquals("IllegalArgumentException", json.get("type"));
       assertEquals("Invalid request type ID format", json.get("message"));
   }
}