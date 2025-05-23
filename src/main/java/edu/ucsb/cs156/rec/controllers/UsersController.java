package edu.ucsb.cs156.rec.controllers;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import edu.ucsb.cs156.rec.entities.RecommendationRequest;
import edu.ucsb.cs156.rec.entities.User;
import edu.ucsb.cs156.rec.repositories.UserRepository;
import io.swagger.v3.core.util.Json;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.web.bind.annotation.RequestParam;

import edu.ucsb.cs156.rec.errors.EntityNotFoundException;

/**
 * This is a REST controller for getting information about the users.
 * 
 * These endpoints are only accessible to users with the role "ROLE_ADMIN".
 */

@Tag(name="User information (admin only except for /professors)")
@RequestMapping("/api/admin/users")
@RestController
public class UsersController extends ApiController {
    @Autowired
    UserRepository userRepository;

    @Autowired
    ObjectMapper mapper;

    /**
     * This method returns a list of all users.  Accessible only to users with the role "ROLE_ADMIN".
     * @return a list of all users
     * @throws JsonProcessingException if there is an error processing the JSON
     */
    @Operation(summary= "Get a list of all users")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping("")
    public ResponseEntity<String> users()
            throws JsonProcessingException {
        Iterable<User> users = userRepository.findAll();
        String body = mapper.writeValueAsString(users);
        return ResponseEntity.ok().body(body);
    }

    /**
     * This method returns a list of all Recommendation Requests requested by current student.
     * @return a list of all Recommendation Requests requested by the current user
     */
    @Operation(summary = "List all professors")
    @PreAuthorize("hasRole('ROLE_USER')")
    @GetMapping("/professors")
    public Iterable<Map<String, Object>> allProfessors(
    ) {
        Iterable<User> professors = userRepository.professorIsTrue();
        // to add privacy, only return professor_id and professor_name
        List<Map<String, Object>> limited_list = new ArrayList<>();
        for (User professor : professors) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", professor.getId());
            map.put("fullName", professor.getFullName());
            limited_list.add(map);
        }
        return limited_list;
    }

    @Operation(summary= "Get user by id")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping("/get")
    public User users(
        @Parameter(name="id", description="Long, id number of user to get", example="1", required=true) @RequestParam Long id)
            throws JsonProcessingException {
        User user = userRepository.findById(id).orElseThrow(() -> new EntityNotFoundException(User.class, id));
        
        return user;
    }

    @Operation(summary= "Delete a user (admin)")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @DeleteMapping("/delete")
    public Object deleteUser_Admin(
        @Parameter(name="id", description="Long, id number of user to delete", example="1", required=true) @RequestParam Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new EntityNotFoundException(User.class, id));
        userRepository.delete(user);
        return genericMessage("User with id %s has been deleted.".formatted(id));
    }

    @Operation(summary = "Toggle the admin field")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping("/toggleAdmin")
    public Object toggleAdmin( @Parameter(name = "id", description = "Long, id number of user to toggle their admin field", example = "1", required = true) @RequestParam Long id){
        User user = userRepository.findById(id)
        .orElseThrow(() -> new EntityNotFoundException(User.class, id));

        user.setAdmin(!user.getAdmin());
        userRepository.save(user);
        return genericMessage("User with id %s has toggled admin status to %s".formatted(id, user.getAdmin()));
    }

    @Operation(summary = "Toggle the professor field")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping("/toggleProfessor")
    public Object toggleProfessor( @Parameter(name = "id", description = "Long, id number of user to toggle their professor field", example = "1", required = true) @RequestParam Long id){
        User user = userRepository.findById(id)
        .orElseThrow(() -> new EntityNotFoundException(User.class, id));

        user.setProfessor(!user.getProfessor());
        userRepository.save(user);
        return genericMessage("User with id %s has toggled professor status to %s".formatted(id, user.getProfessor()));
    }
}