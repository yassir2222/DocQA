{
  "projectId": "docqa-e2e",
  "e2e": {
    "baseUrl": "http://localhost:3000",
    "supportFile": "cypress/support/e2e.js",
    "specPattern": "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    "viewportWidth": 1280,
    "viewportHeight": 720,
    "video": true,
    "screenshotOnRunFailure": true,
    "defaultCommandTimeout": 10000,
    "requestTimeout": 30000,
    "responseTimeout": 30000
  },
  "env": {
    "apiUrl": "http://localhost:8000"
  }
}
