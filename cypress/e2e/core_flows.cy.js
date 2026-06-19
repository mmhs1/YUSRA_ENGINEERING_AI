describe('Core Flows', () => {
  it('should allow user to login', () => {
    cy.visit('/login');
    cy.get('input[type="email"]').type('test@example.com');
    cy.get('input[type="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/');
  });

  it('should start a conversation and send a message', () => {
    cy.visit('/');
    cy.get('input[placeholder*="Enter your prompt here"]').type('Hello Yusra');
    cy.get('button[type="submit"]').click();
    cy.contains('Hello Yusra', { timeout: 10000 }).should('be.visible');
  });

  it('should upload an image', () => {
    cy.visit('/');
    cy.get('input[type="file"]').selectFile('cypress/fixtures/test.png', { force: true });
    cy.contains('test.png').should('be.visible');
  });
});
