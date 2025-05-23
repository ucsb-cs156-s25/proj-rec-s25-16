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
import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.refEq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.request;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import edu.ucsb.cs156.rec.ControllerTestCase;
import edu.ucsb.cs156.rec.entities.RecommendationRequest;
import edu.ucsb.cs156.rec.repositories.RecommendationRequestRepository;
import edu.ucsb.cs156.rec.testconfig.TestConfig;
import joptsimple.internal.OptionNameMap;

@WebMvcTest(controllers = RecommendationRequestController.class)
@Import(TestConfig.class)
public class RecommendationRequestControllerTest extends ControllerTestCase {
    @MockBean
    RecommendationRequestRepository recommendationRequestRepository;

    @MockBean
    UserRepository userRepository;

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

        // arrange
        RecommendationRequest recReq = RecommendationRequest.builder()
                .id(15L)
                .requester(user)
                .professor(prof)
                .recommendationType("PhDprogram")
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

        RecommendationRequest rec1 = RecommendationRequest.builder()
                .id(15L)
                .requester(user1)
                .professor(prof)
                .recommendationType("PhDprogram")
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
        

        RecommendationRequest rec1 = RecommendationRequest.builder()
                .id(67L)
                .requester(user2)
                .professor(prof)
                .recommendationType("PhDprogram")
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

        RecommendationRequest rec1 = RecommendationRequest.builder()
                .id(67L)
                .requester(user2)
                .professor(prof)
                .recommendationType("PhDprogram")
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

        RecommendationRequest rec = RecommendationRequest.builder()
                .id(63L)
                .requester(user1)
                .professor(prof1)
                .recommendationType("PhDprogram")
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
                .recommendationType("PhDprogram")
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
                .recommendationType("PhDprogram")
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

        RecommendationRequest rec = RecommendationRequest.builder()
                .id(67L)
                .requester(user1)
                .professor(prof)
                .recommendationType("PhDprogram")
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
        
        RecommendationRequest rec = RecommendationRequest.builder()
                .id(67L)
                .requester(user2)
                .professor(prof)
                .recommendationType("PhDprogram")
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
                .recommendationType("PhDprogram")
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

    //Prof can edit a Recommendation Request from PENDING to COMPLETED
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

        RecommendationRequest rec = RecommendationRequest.builder()
                .id(67L)
                .requester(student)
                .professor(prof)
                .recommendationType("PhDprogram")
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
                .recommendationType("PhDprogram")
                .details("details")
                .status("COMPLETED")
                .completionDate(LocalDateTime.parse("2022-01-03T00:00:00"))
                .dueDate(LocalDateTime.parse("2022-01-03T00:00:00"))
                .submissionDate(LocalDateTime.parse("2022-01-03T00:00:00"))
                .lastModifiedDate(LocalDateTime.parse("2022-01-03T00:00:00"))
                .build();
        RecommendationRequest rec_corrected = RecommendationRequest.builder()
                .id(67L)
                .requester(student)
                .professor(prof)
                .recommendationType("PhDprogram")
                .details("details")
                .status("COMPLETED")
                .completionDate(LocalDateTime.now())
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
        verify(recommendationRequestRepository, times(1)).save(refEq(rec_corrected, "completionDate"));
        
        String responseString = response.getResponse().getContentAsString();
        RecommendationRequest responseObject = mapper.readValue(responseString, RecommendationRequest.class);
        assert(Duration.between(rec_corrected.getCompletionDate(), responseObject.getCompletionDate()).abs().getSeconds() < 5);
        rec_corrected.setCompletionDate(responseObject.getCompletionDate());

        String expectedJson = mapper.writeValueAsString(rec_corrected);
        assertEquals(expectedJson, responseString);
    }

    //Prof can edit a Recommendation Request from PENDING to DENIED
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

        RecommendationRequest rec = RecommendationRequest.builder()
                .id(67L)
                .requester(student)
                .professor(prof)
                .recommendationType("PhDprogram")
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
                .recommendationType("PhDprogram")
                .details("details")
                .status("DENIED")
                .completionDate(LocalDateTime.parse("2022-01-03T00:00:00"))
                .dueDate(LocalDateTime.parse("2022-01-03T00:00:00"))
                .submissionDate(LocalDateTime.parse("2022-01-03T00:00:00"))
                .lastModifiedDate(LocalDateTime.parse("2022-01-03T00:00:00"))
                .build();
        RecommendationRequest rec_corrected = RecommendationRequest.builder()
                .id(67L)
                .requester(student)
                .professor(prof)
                .recommendationType("PhDprogram")
                .details("details")
                .status("DENIED")
                .completionDate(LocalDateTime.now())
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
        verify(recommendationRequestRepository, times(1)).save(refEq(rec_corrected, "completionDate"));
        
        String responseString = response.getResponse().getContentAsString();
        RecommendationRequest responseObject = mapper.readValue(responseString, RecommendationRequest.class);
        assert(Duration.between(rec_corrected.getCompletionDate(), responseObject.getCompletionDate()).abs().getSeconds() < 5);
        rec_corrected.setCompletionDate(responseObject.getCompletionDate());

        String expectedJson = mapper.writeValueAsString(rec_corrected);
        assertEquals(expectedJson, responseString);
    }

    //Prof can edit a Recommendation Request
    @WithMockUser(roles = {"PROFESSOR"})
    @Test
    public void prof_can_put_recommendation_request_with_status_pending_and_completed_date_does_not_appear() throws Exception {
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

        RecommendationRequest rec = RecommendationRequest.builder()
                .id(67L)
                .requester(student)
                .professor(prof)
                .recommendationType("PhDprogram")
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
                .recommendationType("PhDprogram")
                .details("details")
                .status("PENDING")
                .completionDate(LocalDateTime.parse("2022-01-03T00:00:00"))
                .dueDate(LocalDateTime.parse("2022-01-03T00:00:00"))
                .submissionDate(LocalDateTime.parse("2022-01-03T00:00:00"))
                .lastModifiedDate(LocalDateTime.parse("2022-01-03T00:00:00"))
                .build();
        RecommendationRequest rec_corrected = RecommendationRequest.builder()
                .id(67L)
                .requester(student)
                .professor(prof)
                .recommendationType("PhDprogram")
                .details("details")
                .status("PENDING")
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
        verify(recommendationRequestRepository, times(1)).save(refEq(rec_corrected, "completionDate"));
        
        String responseString = response.getResponse().getContentAsString();
        String expectedJson = mapper.writeValueAsString(rec_corrected);

        assertEquals(expectedJson, responseString);
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

        RecommendationRequest rec_updated = RecommendationRequest.builder()
                .id(67L)
                .requester(user2)
                .professor(prof)
                .recommendationType("PhDprogram")
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
