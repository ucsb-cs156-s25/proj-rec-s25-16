const apiCurrentUserFixtures = {
  adminUser: {
    user: {
      id: 1,
      email: "phtcon@ucsb.edu",
      googleSub: "115856948234298493496",
      pictureUrl:
        "https://lh3.googleusercontent.com/-bQynVrzVIrU/AAAAAAAAAAI/AAAAAAAAAAA/AMZuucmkGuVsELD1ZeV5iDUAUfe6_K-p8w/s96-c/photo.jpg",
      fullName: "Phill Conrad",
      givenName: "Phill",
      familyName: "Conrad",
      emailVerified: true,
      locale: "en",
      hostedDomain: "ucsb.edu",
      admin: true,
    },
    roles: [
      {
        authority: "ROLE_MEMBER",
      },
      {
        authority: "SCOPE_openid",
      },
      {
        authority: "SCOPE_https://www.googleapis.com/auth/userinfo.profile",
      },
      {
        authority: "SCOPE_https://www.googleapis.com/auth/userinfo.email",
      },
      {
        authority: "ROLE_USER",
        attributes: {
          sub: "115856948234298493496",
          name: "Phill Conrad",
          given_name: "Phill",
          family_name: "Conrad",
          picture:
            "https://lh3.googleusercontent.com/a/AATXAJyxrU2gDahCiNe4ampVZlv5176Jo0F0PG3KyYgk=s96-c",
          email: "phtcon@ucsb.edu",
          email_verified: true,
          locale: "en",
          hd: "ucsb.edu",
        },
      },
      {
        authority: "ROLE_ADMIN",
      },
    ],
  },
  userOnly: {
    user: {
      id: 2,
      email: "pconrad.cis@gmail.com",
      googleSub: "102656447703889917227",
      pictureUrl:
        "https://lh3.googleusercontent.com/a-/AOh14GhpDBUt8eCEqiRT45hrFbcimsX_h1ONn0dc3HV8Bp8=s96-c",
      fullName: "Phillip Conrad",
      givenName: "Phillip",
      familyName: "Conrad",
      emailVerified: true,
      locale: "en",
      hostedDomain: null,
      admin: false,
    },
    roles: [
      {
        authority: "SCOPE_openid",
      },
      {
        authority: "ROLE_USER",
        attributes: {
          sub: "102656447703889917227",
          name: "Phillip Conrad",
          given_name: "Phillip",
          family_name: "Conrad",
          picture:
            "https://lh3.googleusercontent.com/a-/AOh14GhpDBUt8eCEqiRT45hrFbcimsX_h1ONn0dc3HV8Bp8=s96-c",
          email: "pconrad.cis@gmail.com",
          email_verified: true,
          locale: "en",
        },
      },
      {
        authority: "SCOPE_https://www.googleapis.com/auth/userinfo.profile",
      },
      {
        authority: "SCOPE_https://www.googleapis.com/auth/userinfo.email",
      },
    ],
  },
  missingRolesToTestErrorHandling: {
    user: {
      id: 2,
      email: "pconrad.cis@gmail.com",
      googleSub: "102656447703889917227",
      pictureUrl:
        "https://lh3.googleusercontent.com/a-/AOh14GhpDBUt8eCEqiRT45hrFbcimsX_h1ONn0dc3HV8Bp8=s96-c",
      fullName: "Phillip Conrad",
      givenName: "Phillip",
      familyName: "Conrad",
      emailVerified: true,
      locale: "en",
      hostedDomain: null,
      admin: false,
    },
  },
  professorUser: {
    user: {
      id: 3,
      email: "professor@ucsb.edu",
      googleSub: "109850895733089793576",
      pictureUrl:
        "https://lh3.googleusercontent.com/-bQynVrzVIrU/AAAAAAAAAAI/AAAAAAAAAAA/AMZuucmkGuVsELD1ZeV5iDUAUfe6_K-p8w/s96-c/photo.jpg",
      fullName: "Professor Gaucho",
      givenName: "Profesor",
      familyName: "Gaucho",
      emailVerified: true,
      locale: null,
      hostedDomain: null,
      admin: false,
      professor: true,
    },
    roles: [
      {
        authority: "SCOPE_openid",
      },
      {
        authority: "ROLE_USER",
      },
      {
        authority: "SCOPE_https://www.googleapis.com/auth/userinfo.profile",
      },
      {
        authority: "ROLE_PROFESSOR",
      },
      {
        authority: "SCOPE_https://www.googleapis.com/auth/userinfo.email",
      },
      {
        authority: "OAUTH2_USER",
        attributes: {
          sub: "109850895733089793576",
          name: "Professor Gaucho",
          given_name: "Professor",
          family_name: "Gaucho",
          picture:
            "https://lh3.googleusercontent.com/-bQynVrzVIrU/AAAAAAAAAAI/AAAAAAAAAAA/AMZuucmkGuVsELD1ZeV5iDUAUfe6_K-p8w/s96-c/photo.jpg",
          email: "professor@ucsb.edu",
          email_verified: true,
        },
      },
    ],
  },
  studentUser: {
    user: {
      id: 4,
      email: "student@ucsb.edu",
      googleSub: "109850895733089793577",
      pictureUrl:
        "https://lh3.googleusercontent.com/-bQynVrzVIrU/AAAAAAAAAAI/AAAAAAAAAAA/AMZuucmkGuVsELD1ZeV5iDUAUfe6_K-p8w/s96-c/photo.jpg",
      fullName: "Student Gaucho",
      givenName: "Student",
      familyName: "Gaucho",
      emailVerified: true,
      locale: null,
      hostedDomain: null,
      admin: false,
      professor: false,
    },
    roles: [
      {
        authority: "SCOPE_openid",
      },
      {
        authority: "ROLE_USER",
      },
      {
        authority: "SCOPE_https://www.googleapis.com/auth/userinfo.profile",
      },
      {
        authority: "SCOPE_https://www.googleapis.com/auth/userinfo.email",
      },
      {
        authority: "OAUTH2_USER",
        attributes: {
          sub: "109850895733089793577",
          name: "Student Gaucho",
          given_name: "Student",
          family_name: "Gaucho",
          picture:
            "https://lh3.googleusercontent.com/-bQynVrzVIrU/AAAAAAAAAAI/AAAAAAAAAAA/AMZuucmkGuVsELD1ZeV5iDUAUfe6_K-p8w/s96-c/photo.jpg",
          email: "student@ucsb.edu",
          email_verified: true,
        },
      },
    ],
  },
};

const currentUserFixtures = {
  adminUser: {
    loggedIn: true,
    root: {
      ...apiCurrentUserFixtures.adminUser,
      rolesList: [
        "ROLE_MEMBER",
        "SCOPE_openid",
        "SCOPE_https://www.googleapis.com/auth/userinfo.profile",
        "SCOPE_https://www.googleapis.com/auth/userinfo.email",
        "ROLE_USER",
        "ROLE_ADMIN",
      ],
    },
  },
  userOnly: {
    loggedIn: true,
    root: {
      ...apiCurrentUserFixtures.userOnly,
      rolesList: [
        "SCOPE_openid",
        "ROLE_USER",
        "SCOPE_https://www.googleapis.com/auth/userinfo.profile",
        "SCOPE_https://www.googleapis.com/auth/userinfo.email",
      ],
    },
  },
  notLoggedIn: {
    loggedIn: false,
    root: {},
  },
  professorUser: {
    loggedIn: true,
    root: {
      ...apiCurrentUserFixtures.professorUser,
      rolesList: [
        "SCOPE_openid",
        "ROLE_USER",
        "ROLE_PROFESSOR",
        "SCOPE_https://www.googleapis.com/auth/userinfo.profile",
        "SCOPE_https://www.googleapis.com/auth/userinfo.email",
      ],
    },
  },
  studentUser: {
    loggedIn: true,
    root: {
      ...apiCurrentUserFixtures.studentUser,
      rolesList: [
        "SCOPE_openid",
        "ROLE_USER",
        "SCOPE_https://www.googleapis.com/auth/userinfo.profile",
        "SCOPE_https://www.googleapis.com/auth/userinfo.email",
      ],
    },
  },
};

export { currentUserFixtures, apiCurrentUserFixtures };
