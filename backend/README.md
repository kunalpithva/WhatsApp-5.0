# Backend API

This is the backend for the application, built with Node.js, Express, and MongoDB. It provides a RESTful API for user authentication, profile management, and campaign creation.

## Features

*   User registration and login with JWT-based authentication
*   Secure password hashing with bcrypt
*   Profile management, including password updates
*   Campaign creation with file uploads
*   User management, including credit allocation

## Prerequisites

*   Node.js (v14 or later)
*   MongoDB
*   `pnpm` (or `npm`/`yarn`)

## Getting Started

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd backend
    ```

2.  **Install dependencies:**

    ```bash
    pnpm install
    ```

3.  **Set up environment variables:**

    Create a `.env` file in the `backend` directory and add the following variables:

    ```env
    MONGO_URI=<your-mongodb-connection-string>
    JWT_SECRET=<your-jwt-secret>
    ```

4.  **Start the server:**

    ```bash
    pnpm start
    ```

    The server will be running on `http://localhost:3000`.

## API Endpoints

All endpoints are prefixed with `/api/auth`.

### Authentication

*   **`POST /api/auth/createaccount`**: Create a new user account.

    **Request Body:**

    ```json
    {
      "username": "testuser",
      "email": "test@example.com",
      "mobile_number": "1234567890",
      "role": "user",
      "password": "Password123!",
      "confirmPassword": "Password123!"
    }
    ```

*   **`POST /api/auth/login`**: Log in a user.

    **Request Body:**

    ```json
    {
      "mobile_number": "1234567890",
      "password": "Password123!"
    }
    ```

### Profile

*   **`GET /api/auth/profile`**: Get the profile of the currently logged-in user.

    **Headers:**

    ```
    Authorization: Bearer <your-jwt-token>
    ```

*   **`PUT /api/auth/profile`**: Update the password of the currently logged-in user.

    **Headers:**

    ```
    Authorization: Bearer <your-jwt-token>
    ```

    **Request Body:**

    ```json
    {
      "oldPassword": "Password123!",
      "newPassword": "NewPassword123!"
    }
    ```

### Campaigns

*   **`POST /api/auth/createcampaign`**: Create a new campaign.

    **Headers:**

    ```
    Authorization: Bearer <your-jwt-token>
    ```

    **Request Body (form-data):**

    *   `campaignname`: The name of the campaign.
    *   `mobienumbers`: A list of mobile numbers.
    *   `message`: The message to be sent.
    *   `button_title`: The title of the button.
    *   `button_url`: The URL for the button.
    *   `button_number`: The number for the button.
    *   `files`: Up to 4 files (`.csv`, `.xlsx`, `.xls`, `.txt`).

*   **`GET /api/auth/mycampaigns`**: Get all campaigns created by the currently logged-in user.

    **Headers:**

    ```
    Authorization: Bearer <your-jwt-token>
    ```

### User Management

*   **`GET /api/auth/manageusers`**: Get all users managed by the currently logged-in user.

    **Headers:**

    ```
    Authorization: Bearer <your-jwt-token>
    ```

*   **`PUT /api/auth/manageusers`**: Update the credits of a managed user.

    **Headers:**

    ```
    Authorization: Bearer <your-jwt-token>
    ```

    **Request Body:**

    ```json
    {
      "userId": "user-id-to-update",
      "creditChange": 10
    }
    ```

*   **`GET /api/auth/allusers`**: Get all users in the system.
