# Telegram Trends - Backend

## Overview

This backend is part of the Telegram Trends dashboard application. It is built using Node.js and Express, and connects to a MongoDB database to store and retrieve community metrics data.

## Features

- **API Endpoints**: Provides endpoints to fetch community metrics such as total members, growth rate, engagement rate, and top contributors.
- **MongoDB**: Uses MongoDB for data storage and retrieval.

## File Structure

- **controllers**
  - `communityController.js`: Contains the logic for handling community-related requests.
- **models**
  - `Community.js`: Mongoose schema and model for the Community collection.
- **routes**
  - `communityRoutes.js`: Defines the API routes for community-related endpoints.
- `server.js`: Entry point of the backend application.

## Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>

2. Navigate to the backend directory:

    ```bash
    cd <project-directory>/backend

3. Install the dependencies:
    ```bash
    npm install

4. Set up environment variables:

Create a .env file in the root of the backend directory and add the following variables:

    PORT=5000
    MONGO_URI=<your-mongodb-uri>

5. Start the backend server:

    ```bash
    npm start

## API Endpoints

- GET /api/community/
    - /metrics
Fetches community metrics such as total members, growth rate, engagement rate, and top contributors for a specific community.

## Models
### Community
The Community model represents a community in the database. It includes the following fields:

- `name`: Name of the community.
- `totalMembers`: Total number of members in the community.
- `growthRate`: Growth rate of the community.
- `engagementRate`: Engagement rate of the community.
- `topContributors`: List of top contributors in the community.

### Controllers
communityController.js
Contains the logic for handling community-related requests, including fetching community metrics from the database.

### Routes
communityRoutes.js
Defines the API routes for community-related endpoints. Uses the communityController to handle requests.

### Contributions
Contributions are welcome! Please fork the repository and submit a pull request for any improvements or bug fixes.