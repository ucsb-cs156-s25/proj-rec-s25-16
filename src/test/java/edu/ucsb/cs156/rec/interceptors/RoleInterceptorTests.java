package edu.ucsb.cs156.rec.interceptors;
import org.mockito.Mock;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerExecutionChain;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.handler.HandlerMappingIntrospector;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerAdapter;

import edu.ucsb.cs156.rec.repositories.UserRepository;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import net.bytebuddy.implementation.bind.annotation.Default;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Optional;
import java.util.HashSet;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Collection;
import java.util.HashMap;
import java.util.stream.Collectors;

import javax.management.relation.Role;

import edu.ucsb.cs156.rec.ControllerTestCase;
import edu.ucsb.cs156.rec.entities.User;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;


@SpringBootTest
@AutoConfigureMockMvc
public class RoleInterceptorTests extends ControllerTestCase{
    @MockBean
    UserRepository userRepository;

    @Autowired
    private HandlerMappingIntrospector mapping;

    @BeforeEach
    public void testLogin(){
        HashMap<String, Object> values = new HashMap<>();
        values.put("email", "joegaucho@ucsb.edu");
        values.put("googleSub", "googleSub");
        values.put("pictureUrl", "pictureUrl");
        values.put("fullName", "Joe Gaucho");
        values.put("givenName", "Joe");
        values.put("familyName", "Gaucho");
        values.put("emailVerified", true);
        values.put("locale", "en");
        values.put("hostedDomain", "ucsb.edu");

        Set<GrantedAuthority> credentials = new HashSet<>();
        credentials.add(new SimpleGrantedAuthority("ROLE_USER"));
        credentials.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
        credentials.add(new SimpleGrantedAuthority("ROLE_PROFESSOR"));
        credentials.add(new SimpleGrantedAuthority("ROLE_STUDENT"));

        OAuth2User user = new DefaultOAuth2User(credentials,values,"email");
        Authentication auth = new OAuth2AuthenticationToken(user, credentials, "google");
        SecurityContextHolder.setContext(SecurityContextHolder.createEmptyContext());
        SecurityContextHolder.getContext().setAuthentication(auth); 
    }

    @Test
    public void RoleInterceptorExists() throws Exception{
        MockHttpServletRequest req = new MockHttpServletRequest("GET", "/api/currentuser");
        HandlerExecutionChain chain = mapping.getMatchableHandlerMapping(req).getHandler(req);

        assert chain != null;
        Optional<HandlerInterceptor> RoleInterceptor = chain.getInterceptorList().stream().filter(RoleInterceptor.class::isInstance).findFirst();

        assertTrue(RoleInterceptor.isPresent());
    }
    
    @Test
    public void no_user_means_no_updates() throws Exception{
        User user = User.builder()
                .email("nogaucho@ucsb.edu")
                .id(15L)
                .admin(false)
                .professor(false)
                .build();
        when(userRepository.findByEmail("nogaucho@ucsb.edu")).thenReturn(Optional.of(user));

        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/currentUser");
        HandlerExecutionChain chain = mapping.getMatchableHandlerMapping(request).getHandler(request);
        MockHttpServletResponse response = new MockHttpServletResponse();

        assert chain != null;
        Optional<HandlerInterceptor> RoleInterceptor = chain.getInterceptorList()
                        .stream()
                        .filter(RoleInterceptor.class::isInstance)
                        .findFirst();

        assertTrue(RoleInterceptor.isPresent());

        RoleInterceptor.get().preHandle(request, response, chain.getHandler());

        verify(userRepository, times(1)).findByEmail("joegaucho@ucsb.edu");

        Collection<? extends GrantedAuthority> authorities = SecurityContextHolder.getContext()
            .getAuthentication().getAuthorities();

        boolean role_admin = authorities.stream()
            .anyMatch(grantedAuth -> grantedAuth.getAuthority().equals("ROLE_ADMIN"));
        boolean role_professor = authorities.stream()
            .anyMatch(grantedAuth -> grantedAuth.getAuthority().equals("ROLE_PROFESSOR"));
        boolean role_user = authorities.stream()
            .anyMatch(grantedAuth -> grantedAuth.getAuthority().equals("ROLE_USER"));
        assertTrue(role_admin, "ROLE_ADMIN should be in roles list");
        assertTrue(role_professor, "ROLE_PROFESSOR should be in roles list");
        assertTrue(role_user, "ROLE_USER should be in roles list");

    }

    @Test
    public void does_not_give_admin_to_non_admin() throws Exception{
        User user = User.builder()
                .email("joegaucho@ucsb.edu")
                .id(15L)
                .admin(false)
                .professor(true)
                .build();

        when(userRepository.findByEmail("joegaucho@ucsb.edu")).thenReturn(Optional.of(user));  
        
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/currentUser");
        HandlerExecutionChain chain = mapping.getMatchableHandlerMapping(request).getHandler(request);
        MockHttpServletResponse response = new MockHttpServletResponse();

        assert chain != null;
        Optional<HandlerInterceptor> RoleInterceptor = chain.getInterceptorList()
                        .stream()
                        .filter(RoleInterceptor.class::isInstance)
                        .findFirst();

        RoleInterceptor.get().preHandle(request, response, chain.getHandler());

        verify(userRepository, times(1)).findByEmail("joegaucho@ucsb.edu");

        Collection<? extends GrantedAuthority> authorities = SecurityContextHolder.getContext()
            .getAuthentication().getAuthorities();

        boolean role_admin = authorities.stream()
            .anyMatch(grantedAuth -> grantedAuth.getAuthority().equals("ROLE_ADMIN"));
        boolean role_professor = authorities.stream()
            .anyMatch(grantedAuth -> grantedAuth.getAuthority().equals("ROLE_PROFESSOR"));
        boolean role_user = authorities.stream()
            .anyMatch(grantedAuth -> grantedAuth.getAuthority().equals("ROLE_USER"));
        assertFalse(role_admin, "ROLE_ADMIN should not be in roles list");
        assertTrue(role_professor, "ROLE_PROFESSOR should be in roles list");
        assertTrue(role_user, "ROLE_USER should be in roles list");
    }

    @Test
    public void student_professor_admin_show_up() throws Exception{
        User user = User.builder()
                .email("joegaucho@ucsb.edu")
                .id(15L)
                .admin(true)
                .professor(true)
                .build();

        when(userRepository.findByEmail("joegaucho@ucsb.edu")).thenReturn(Optional.of(user));  
        
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/currentUser");
        HandlerExecutionChain chain = mapping.getMatchableHandlerMapping(request).getHandler(request);
        MockHttpServletResponse response = new MockHttpServletResponse();

        assert chain != null;
        Optional<HandlerInterceptor> RoleInterceptor = chain.getInterceptorList()
                        .stream()
                        .filter(RoleInterceptor.class::isInstance)
                        .findFirst();

        RoleInterceptor.get().preHandle(request, response, chain.getHandler());

        verify(userRepository, times(1)).findByEmail("joegaucho@ucsb.edu");

        Collection<? extends GrantedAuthority> authorities = SecurityContextHolder.getContext()
            .getAuthentication().getAuthorities();

        boolean role_admin = authorities.stream()
            .anyMatch(grantedAuth -> grantedAuth.getAuthority().equals("ROLE_ADMIN"));
        boolean role_professor = authorities.stream()
            .anyMatch(grantedAuth -> grantedAuth.getAuthority().equals("ROLE_PROFESSOR"));
        boolean role_user = authorities.stream()
            .anyMatch(grantedAuth -> grantedAuth.getAuthority().equals("ROLE_USER"));
        assertTrue(role_admin, "ROLE_ADMIN should be in roles list");
        assertTrue(role_professor, "ROLE_PROFESSOR should be in roles list");
        assertTrue(role_user, "ROLE_USER should be in roles list");
    }

    @Test
    public void updates_prof_when_user_not_prof() throws Exception{
        User user = User.builder()
                .email("joegaucho@ucsb.edu")
                .id(15L)
                .admin(true)
                .professor(false)
                .build();

        when(userRepository.findByEmail("joegaucho@ucsb.edu")).thenReturn(Optional.of(user));  
        
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/currentUser");
        HandlerExecutionChain chain = mapping.getMatchableHandlerMapping(request).getHandler(request);
        MockHttpServletResponse response = new MockHttpServletResponse();

        assert chain != null;
        Optional<HandlerInterceptor> RoleInterceptor = chain.getInterceptorList()
                        .stream()
                        .filter(RoleInterceptor.class::isInstance)
                        .findFirst();

        RoleInterceptor.get().preHandle(request, response, chain.getHandler());

        verify(userRepository, times(1)).findByEmail("joegaucho@ucsb.edu");

        Collection<? extends GrantedAuthority> authorities = SecurityContextHolder.getContext()
            .getAuthentication().getAuthorities();

        boolean role_admin = authorities.stream()
            .anyMatch(grantedAuth -> grantedAuth.getAuthority().equals("ROLE_ADMIN"));
        boolean role_professor = authorities.stream()
            .anyMatch(grantedAuth -> grantedAuth.getAuthority().equals("ROLE_PROFESSOR"));
        boolean role_user = authorities.stream()
            .anyMatch(grantedAuth -> grantedAuth.getAuthority().equals("ROLE_USER"));
        assertTrue(role_admin, "ROLE_ADMIN should be in roles list");
        assertFalse(role_professor, "ROLE_PROFESSOR should not be in roles list");
        assertTrue(role_user, "ROLE_USER should be in roles list");
    }
            
}
