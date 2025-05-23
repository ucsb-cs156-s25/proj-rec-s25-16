package edu.ucsb.cs156.rec.controllers;

import edu.ucsb.cs156.rec.ControllerTestCase;
import edu.ucsb.cs156.rec.entities.User;
import edu.ucsb.cs156.rec.repositories.UserRepository;
import edu.ucsb.cs156.rec.testconfig.TestConfig;

import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MvcResult;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.mockito.ArgumentMatchers.any;


import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.Map;

@WebMvcTest(controllers = UsersController.class)
@Import(TestConfig.class)
public class UsersControllerTests extends ControllerTestCase {

  @MockBean
  UserRepository userRepository;

  @Test
  public void users__logged_out() throws Exception {
    mockMvc.perform(get("/api/admin/users"))
        .andExpect(status().is(403));
  }

  @WithMockUser(roles = { "USER" })
  @Test
  public void users__user_logged_in() throws Exception {
    mockMvc.perform(get("/api/admin/users"))
        .andExpect(status().is(403));
  }

  @WithMockUser(roles = { "ADMIN", "USER" })
  @Test
  public void users__admin_logged_in() throws Exception {

    // arrange

    User u1 = User.builder().id(1L).build();
    User u2 = User.builder().id(2L).build();
    User u = currentUserService.getCurrentUser().getUser();

    ArrayList<User> expectedUsers = new ArrayList<>();
    expectedUsers.addAll(Arrays.asList(u1, u2, u));

    when(userRepository.findAll()).thenReturn(expectedUsers);
    String expectedJson = mapper.writeValueAsString(expectedUsers);
    
    // act

    MvcResult response = mockMvc.perform(get("/api/admin/users"))
        .andExpect(status().isOk()).andReturn();

    // assert

    verify(userRepository, times(1)).findAll();
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);

  }

  @WithMockUser(roles = { "ADMIN", "USER" })
  @Test
  public void admin_can_get() throws Exception{
      User user1 = User.builder().email("joegaucho@ucsb.edu").id(17L).build();
      when(userRepository.findById(eq(17L))).thenReturn(Optional.of(user1));


      MvcResult response = mockMvc.perform(get("/api/admin/users/get?id=17"))
              .andExpect(status().isOk()).andReturn();



      verify(userRepository, times(1)).findById(17L);
      String expectedJson = mapper.writeValueAsString(user1);
      String responseString = response.getResponse().getContentAsString();
      assertEquals(expectedJson, responseString);
  }

  @WithMockUser(roles = { "ADMIN", "USER" })
  @Test
  public void admin_cant_get_nonexistent() throws Exception{
      when(userRepository.findById(eq(17L))).thenReturn(Optional.empty());
      MvcResult response = mockMvc.perform(get("/api/admin/users/get?id=15"))
              .andExpect(status().is(404)).andReturn();
      verify(userRepository, times(1)).findById(15L);
      Map<String, Object> json = responseToJson(response);
      assertEquals("User with id 15 not found", json.get("message"));
  }

  @WithMockUser(roles = { "ADMIN", "USER" })
  @Test
  public void admin_can_delete() throws Exception{
     User user1 = User.builder().email("joegaucho@ucsb.edu").id(17L).build();
     when(userRepository.findById(eq(17L))).thenReturn(Optional.of(user1));
     MvcResult response = mockMvc.perform(delete("/api/admin/users/delete?id=17").with(csrf()))
             .andExpect(status().isOk()).andReturn();
    
    verify(userRepository, times(1)).delete(user1);
    verify(userRepository, times(1)).findById(17L);
    Map<String, Object> json = responseToJson(response);
    assertEquals("User with id 17 has been deleted.", json.get("message"));
  }

  @WithMockUser(roles = { "ADMIN", "USER" })
  @Test
  public void admin_cant_delete_nonexistent() throws Exception{
     User user1 = User.builder().email("joegaucho@ucsb.edu").id(17L).build();
     when(userRepository.findById(eq(17L))).thenReturn(Optional.of(user1));
     MvcResult response = mockMvc.perform(
      delete("/api/admin/users/delete?id=15").with(csrf()))
      .andExpect(status().isNotFound()).andReturn();
    
    verify(userRepository, times(1)).findById(15L);
    Map<String, Object> json = responseToJson(response);
    assertEquals("User with id 15 not found", json.get("message"));
  }

  @WithMockUser(roles = { "ADMIN", "USER" })
  @Test
  public void admin_can_toggle_admin() throws Exception{
     User user1 = User.builder().email("joegaucho@ucsb.edu").id(17L).admin(false).build();
     when(userRepository.findById(eq(17L))).thenReturn(Optional.of(user1));
     MvcResult response = mockMvc.perform(post("/api/admin/users/toggleAdmin?id=17").with(csrf()))
             .andExpect(status().isOk()).andReturn();
    
    verify(userRepository, times(1)).findById(17L);
    Map<String, Object> json = responseToJson(response);
    assertEquals("User with id 17 has toggled admin status to true", json.get("message"));
  }

  @WithMockUser(roles = { "ADMIN", "USER" })
  @Test
  public void admin_can_toggle_admin_flip() throws Exception{
     User user1 = User.builder().email("joegaucho@ucsb.edu").id(17L).admin(true).build();
     when(userRepository.findById(eq(17L))).thenReturn(Optional.of(user1));
     MvcResult response = mockMvc.perform(post("/api/admin/users/toggleAdmin?id=17").with(csrf()))
             .andExpect(status().isOk()).andReturn();
    
    verify(userRepository, times(1)).findById(17L);
    Map<String, Object> json = responseToJson(response);
    assertEquals("User with id 17 has toggled admin status to false", json.get("message"));
  }

  @WithMockUser(roles = { "ADMIN", "USER" })
  @Test
  public void admin_cant_toggle_admin_nonexistent() throws Exception{
     User user1 = User.builder().email("joegaucho@ucsb.edu").id(17L).build();
     when(userRepository.findById(eq(17L))).thenReturn(Optional.of(user1));
     MvcResult response = mockMvc.perform(post("/api/admin/users/toggleAdmin?id=15").with(csrf()))
             .andExpect(status().is(404)).andReturn();
    
    verify(userRepository, times(1)).findById(15L);
    Map<String, Object> json = responseToJson(response);
    assertEquals("User with id 15 not found", json.get("message"));
  }

  @WithMockUser(roles = { "ADMIN", "USER" })
  @Test
  public void admin_can_toggle_professor() throws Exception{
     User user1 = User.builder().email("joegaucho@ucsb.edu").id(17L).professor(false).build();
     when(userRepository.findById(eq(17L))).thenReturn(Optional.of(user1));
     MvcResult response = mockMvc.perform(post("/api/admin/users/toggleProfessor?id=17").with(csrf()))
             .andExpect(status().isOk()).andReturn();
    
    verify(userRepository, times(1)).findById(17L);
    Map<String, Object> json = responseToJson(response);
    assertEquals("User with id 17 has toggled professor status to true", json.get("message"));
  }

  @WithMockUser(roles = { "ADMIN", "USER" })
  @Test
  public void admin_can_toggle_professor_flip() throws Exception{
     User user1 = User.builder().email("joegaucho@ucsb.edu").id(17L).professor(true).build();
     when(userRepository.findById(eq(17L))).thenReturn(Optional.of(user1));
     MvcResult response = mockMvc.perform(post("/api/admin/users/toggleProfessor?id=17").with(csrf()))
             .andExpect(status().isOk()).andReturn();
    
    verify(userRepository, times(1)).findById(17L);
    Map<String, Object> json = responseToJson(response);
    assertEquals("User with id 17 has toggled professor status to false", json.get("message"));
  }

  @WithMockUser(roles = { "ADMIN", "USER" })
  @Test
  public void admin_cant_toggle_professor_nonexistent() throws Exception{
     User user1 = User.builder().email("joegaucho@ucsb.edu").id(17L).build();
     when(userRepository.findById(eq(17L))).thenReturn(Optional.of(user1));
     MvcResult response = mockMvc.perform(post("/api/admin/users/toggleProfessor?id=15").with(csrf()))
             .andExpect(status().is(404)).andReturn();
    
    verify(userRepository, times(1)).findById(15L);
    Map<String, Object> json = responseToJson(response);
    assertEquals("User with id 15 not found", json.get("message"));
  }

  @WithMockUser(roles = { "USER" })
  @Test
  public void non_admin_can_get_all_professors() throws Exception{
    User professor = User.builder().id(1L).professor(true).email("phtcon@ucsb.edu").fullName("Phill Conrad").familyName("Conrad").build();
    Iterable<User> professors = Arrays.asList(professor);
    when(userRepository.professorIsTrue()).thenReturn(professors);
    MvcResult response = mockMvc.perform(get("/api/admin/users/professors").with(csrf()))
             .andExpect(status().isOk()).andReturn();
    verify(userRepository, times(1)).professorIsTrue();
    String responseString = response.getResponse().getContentAsString();
    assertTrue(responseString.contains("Phill Conrad"));
    assertTrue(responseString.contains("1"));
    assertFalse(responseString.contains("email"));
  }

}
