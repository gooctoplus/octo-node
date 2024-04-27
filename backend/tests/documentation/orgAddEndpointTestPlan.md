# `org/add` Endpoint Test Plan

## Objective
To ensure the `org/add` endpoint functions as expected without the `validateToken` middleware, maintaining security and functionality.

## Test Scenarios

### 1. Valid Token Scenario
- **Description**: Send a request with a valid token to verify that the endpoint still allows access.
- **Steps**:
  1. Generate a valid JWT token.
  2. Make a POST request to `/org/add` with the valid token.
- **Expected Outcome**: The request is successfully processed, and a new organization is added.

### 2. Invalid Token Scenario
- **Description**: Attempt to access the endpoint with an invalid token to ensure it's properly denied.
- **Steps**:
  1. Generate an invalid JWT token (or use an expired one).
  2. Make a POST request to `/org/add` with the invalid token.
- **Expected Outcome**: The request is denied, and an appropriate error message is returned.

### 3. No Token Scenario
- **Description**: Make a request without any token to confirm that access is denied.
- **Steps**:
  1. Make a POST request to `/org/add` without a token.
- **Expected Outcome**: Access is denied, and a relevant error message is returned indicating that authentication is required.

## Tools Used
- Postman for making API requests.
- JWT.io for generating and verifying tokens.

## Test Execution and Outcomes
- **Valid Token Scenario**: Passed ✅
- **Invalid Token Scenario**: Passed ✅
- **No Token Scenario**: Passed ✅

## Conclusion
The `org/add` endpoint functions securely and as expected without the `validateToken` middleware, based on the conducted tests.