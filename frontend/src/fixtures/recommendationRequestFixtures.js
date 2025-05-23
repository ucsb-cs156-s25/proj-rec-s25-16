const recommendationRequestFixtures = {
  oneRecommendation: [
    {
      id: 1,
      professor_id: 1,
      professor: {
        fullName: "Phil Conrad",
        email: "phtcon@ucsb.edu",
      },
      submissionDate: "2022-02-02T12:00",
      dueDate: "2022-04-02T12:00",
      lastModifiedDate: "2022-02-02T12:00",
      completionDate: "",
      status: "PENDING",
      details: "details",
      requestType: {
        // CHANGED: object instead of string
        id: 1,
        requestType: "CS Department BS/MS program",
      },
      requester_id: 1,
      requester: {
        fullName: "Divyani Punj",
        email: "divyanipunj@ucsb.edu",
      },
    },
  ],

  threeRecommendations: [
    {
      id: 2,
      professor_id: 2,
      professor: {
        fullName: "Chaewon Bang",
        email: "chaewonbang@ucsb.edu",
      },
      submissionDate: "2022-01-02T12:00",
      dueDate: "2022-09-02T12:00",
      lastModifiedDate: "2022-06-02T12:00",
      completionDate: "2022-06-02T12:00",
      status: "COMPLETED",
      details: "lots of details",
      requestType: {
        // CHANGED: object instead of string
        id: 1,
        requestType: "CS Department BS/MS program",
      },
      requester_id: 2,
      requester: {
        fullName: "Mia Scott",
        email: "mscott@ucsb.edu",
      },
    },

    {
      id: 3,
      professor_id: 3,
      professor: {
        fullName: "Lithika Anabarasan",
        email: "lithika@ucsb.edu",
      },
      submissionDate: "2022-02-02T12:00",
      dueDate: "2022-10-02T12:00",
      lastModifiedDate: "2022-02-02T12:00",
      completionDate: "",
      status: "PENDING",
      details: "test details",
      requestType: {
        // CHANGED: object instead of string
        id: 1,
        requestType: "CS Department BS/MS program",
      },
      requester_id: 3,
      requester: {
        fullName: "Shrena Punj",
        email: "shrenapunj@ucsb.edu",
      },
    },
    {
      id: 4,
      professor_id: 4,
      professor: {
        fullName: "Riya Seghal",
        email: "riya@ucsb.edu",
      },
      submissionDate: "2022-02-02T12:00",
      dueDate: "2022-04-02T12:00",
      lastModifiedDate: "2022-02-02T12:00",
      completionDate: "2022-02-03T12:00",
      status: "COMPLETED",
      details: "test details",
      requestType: {
        // CHANGED: object instead of string
        id: 1,
        requestType: "CS Department BS/MS program",
      },
      requester_id: 4,
      requester: {
        fullName: "Krish Seghal",
        email: "krishseghal@ucsb.edu",
      },
    },
  ],

  oneCompleted: [
    {
      id: 4,
      requesterEmail: "student4@ucsb.edu",
      professorEmail: "professor1@ucsb.edu",
      explanation: "Please write me a recommendation",
      dateRequested: "2024-02-01T00:00:00",
      dateNeeded: "2024-03-01T00:00:00",
      status: "COMPLETED",
      done: true,
    },
  ],

  oneDenied: [
    {
      id: 5,
      requesterEmail: "student5@ucsb.edu",
      professorEmail: "professor1@ucsb.edu",
      explanation: "Please write me a recommendation",
      dateRequested: "2024-02-01T00:00:00",
      dateNeeded: "2024-03-01T00:00:00",
      status: "DENIED",
      done: true,
    },
  ],

  mixedRequests: [
    {
      id: 6,
      requesterEmail: "student6@ucsb.edu",
      professorEmail: "professor1@ucsb.edu",
      requester: {
        fullName: "Student Six",
        email: "student6@ucsb.edu",
      },
      professor: {
        fullName: "Professor One",
        email: "professor1@ucsb.edu",
      },
      details: "Completed request",
      requestType: {
        // CHANGED: object instead of string
        id: 2,
        requestType: "Graduate School",
      },
      status: "COMPLETED",
      submissionDate: "2024-02-01T00:00:00",
      dueDate: "2024-03-01T00:00:00",
      lastModifiedDate: "2024-02-15T00:00:00",
      completionDate: "2024-02-15T00:00:00",
      done: true,
    },
    {
      id: 7,
      requesterEmail: "student7@ucsb.edu",
      professorEmail: "professor1@ucsb.edu",
      requester: {
        fullName: "Student Seven",
        email: "student7@ucsb.edu",
      },
      professor: {
        fullName: "Professor One",
        email: "professor1@ucsb.edu",
      },
      details: "Denied request",
      requestType: {
        // CHANGED: object instead of string
        id: 2,
        requestType: "Graduate School",
      },
      status: "DENIED",
      submissionDate: "2024-02-01T00:00:00",
      dueDate: "2024-03-01T00:00:00",
      lastModifiedDate: "2024-02-15T00:00:00",
      completionDate: "2024-02-15T00:00:00",
      done: true,
    },
    {
      id: 8,
      requesterEmail: "student8@ucsb.edu",
      professorEmail: "professor1@ucsb.edu",
      requester: {
        fullName: "Student Eight",
        email: "student8@ucsb.edu",
      },
      professor: {
        fullName: "Professor One",
        email: "professor1@ucsb.edu",
      },
      details: "Pending request",
      requestType: {
        // CHANGED: object instead of string
        id: 2,
        requestType: "Graduate School",
      },
      status: "PENDING",
      submissionDate: "2024-02-01T00:00:00",
      dueDate: "2024-03-01T00:00:00",
      lastModifiedDate: "2024-02-15T00:00:00",
      completionDate: null,
      done: false,
    },
  ],
};

export { recommendationRequestFixtures };
