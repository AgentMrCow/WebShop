# Secure Web Shop - Phase 4 Documentation

## Introduction

You can find my demo video `IERG4210 Phase 4.mp4` on [https://www.youtube.com/watch?v=wojnivtoeDI](https://www.youtube.com/watch?v=wojnivtoeDI) or locally in the root directory. This document outlines the security measures implemented in the web application as part of Phase 4. The focus has been on mitigating common web security vulnerabilities such as XSS, SQL Injection, CSRF, and ensuring secure authentication and session management.

## Security Implementations

### 1. XSS (Cross-Site Scripting) Prevention

- **Client-Side Input Restrictions**: Utilized `zod`, JavaScript and HTML5 attributes (like `maxlength`, `type`, and custom validation patterns) to restrict user input on all forms.
- **Server-Side Input Sanitization and Validation**: Integrated `zod` for schema validation and used `isomorphic-dompurify` to sanitize user inputs and prevent malicious scripts from being saved or executed.
- **Output Sanitization**: Ensured that data displayed back to users is sanitized, especially in dynamic content, to prevent stored XSS attacks.

_Code Reference_: `zod.tsx` for input validation and sanitization schemas.

### 2. SQL Injection Mitigation

- **Parameterized Queries**: Used parameterized queries by `prisma` in all database interactions to separate SQL code from data, effectively preventing SQL injection.

### 3. CSRF (Cross-Site Request Forgery) Prevention

- **Secret Nonces**: Implemented secret nonces that are tied to the user session and validated on every form submission to prevent CSRF attacks by `next-auth`.
- **Double Submit Cookie Pattern**: Utilized cookies to store CSRF tokens and validated them against the token sent in form submissions.

### 4. Authentication and Session Management

- **User Authentication**: Implemented a secure login system with email and password. Used `bcrypt` for password hashing and comparisons.
- **Session Management**: Utilized JWT for session management, ensuring tokens are stored securely using HttpOnly cookies. Implemented token rotation upon login to prevent session fixation attacks.
- **Password Management**: Enabled users to change passwords securely, validating the current password before updating and ensuring logout post-password change.

_Code Reference_: `auth` directory for authentication and session management implementations.

### 5. Secure Administration Panel

- **Access Control**: Restricted access to the administration panel to authenticated users with admin privileges only by `middleware.ts`.
- **Session Validation**: Ensured that every request to the admin panel validates the session token to confirm administrative privileges.

### 6. Session ID and Nonce Security

- Ensured that all session IDs and nonces are generated using secure, non-predictable algorithms to prevent guessing attacks.

### 7. SSL/TLS Implementation

- **Certificate Application**: Applied for and obtained an SSL certificate to enable HTTPS on the domain [https://secure.s24.ierg4210.ie.cuhk.edu.hk/](https://secure.s24.ierg4210.ie.cuhk.edu.hk/)
- **Secure Configuration**: Configured Nginx to use strong algorithms and secure cipher suites, ensuring that all HTTP traffic is redirected to HTTPS.

### Advanced Authentication System

- **Multi-Provider Authentication**: Integrated third-party OAuth providers (Google and GitHub) to offer users alternative login options, enhancing the user login experience and security.
- **Session Management Enhancements**: Custom session handling logic with JWT, extending the session capabilities to include user roles (admin, user) and the authentication provider, allowing for more granular access control and personalized user experiences.
- **Register**: Allow user to register and login with own account instead of hard code account.

_Code Snippets_: `NextAuth` setup in `[...nextauth].ts`.

## Conclusion

The security measures implemented aim to protect the web application from common threats and vulnerabilities, ensuring the integrity, confidentiality, and availability of the user data and the application itself. Further enhancements and security audits are planned to continuously improve the security posture of the application.
