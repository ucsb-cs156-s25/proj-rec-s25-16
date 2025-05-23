package edu.ucsb.cs156.rec.controllers;

import edu.ucsb.cs156.rec.testconfig.TestConfig;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@Import(TestConfig.class)
@AutoConfigureMockMvc
@ActiveProfiles("development")
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:h2:mem:testdb",
    "spring.jpa.hibernate.ddl-auto=create-drop",
    "spring.h2.console.enabled=false"
})
public class CSRFControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    public void csrf_returns_ok() throws Exception {
        String body = mockMvc.perform(get("/csrf"))
            .andExpect(status().isOk())
            .andReturn()
            .getResponse()
            .getContentAsString();

        assertTrue(body.contains("parameterName"));
        assertTrue(body.contains("_csrf"));
        assertTrue(body.contains("headerName"));
        assertTrue(body.contains("X-XSRF-TOKEN"));
    }
}