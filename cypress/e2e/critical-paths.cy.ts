describe('Critical User Journeys', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('allows user to login and access dashboard', () => {
    cy.login('test@example.com', 'password123');
    cy.get('[data-testid="dashboard"]').should('exist');
    cy.get('[data-testid="user-role"]').should('be.visible');
  });

  it('completes applicant registration process', () => {
    cy.login('branch@example.com', 'password123');
    
    // Navigate to registration
    cy.get('[data-testid="new-applicant"]').click();

    // Fill personal information
    cy.get('input[name="fullName"]').type('John Doe');
    cy.get('input[name="email"]').type('john@example.com');
    cy.get('input[name="phone"]').type('+1234567890');
    cy.get('[data-testid="next-button"]').click();

    // Fill job preferences
    cy.get('select[name="jobType"]').select('Factory Worker');
    cy.get('input[name="expectedSalary"]').type('2000');
    cy.get('[data-testid="next-button"]').click();

    // Fill education
    cy.get('input[name="education.school"]').type('Test University');
    cy.get('input[name="education.year"]').type('2020');
    cy.get('[data-testid="next-button"]').click();

    // Submit form
    cy.get('[data-testid="submit-button"]').click();

    // Verify success
    cy.get('[data-testid="success-message"]')
      .should('contain', 'Applicant registered successfully');
  });

  it('completes transfer workflow', () => {
    // Login as branch manager
    cy.login('branch@example.com', 'password123');

    // Navigate to applicant
    cy.get('[data-testid="applicants-list"]').click();
    cy.get('[data-testid="applicant-item"]').first().click();

    // Request transfer
    cy.get('[data-testid="request-transfer"]').click();
    cy.get('textarea[name="transferReason"]')
      .type('Ready for head office processing');
    cy.get('[data-testid="submit-transfer"]').click();

    // Verify transfer request
    cy.get('[data-testid="transfer-status"]')
      .should('contain', 'Transfer requested');

    // Login as admin
    cy.logout();
    cy.login('admin@example.com', 'password123');

    // Approve transfer
    cy.get('[data-testid="transfers-list"]').click();
    cy.get('[data-testid="transfer-item"]').first().click();
    cy.get('[data-testid="approve-transfer"]').click();

    // Assign HO officer
    cy.get('select[name="officerId"]').select('Officer 1');
    cy.get('[data-testid="assign-officer"]').click();

    // Verify assignment
    cy.get('[data-testid="transfer-status"]')
      .should('contain', 'Assigned to HO Officer');
  });

  it('handles expense submission and approval', () => {
    // Login as branch manager
    cy.login('branch@example.com', 'password123');

    // Create expense
    cy.get('[data-testid="expenses"]').click();
    cy.get('[data-testid="new-expense"]').click();
    cy.get('input[name="amount"]').type('1000');
    cy.get('select[name="type"]').select('Travel');
    cy.get('textarea[name="description"]')
      .type('Travel expenses for applicant');
    cy.get('[data-testid="submit-expense"]').click();

    // Verify submission
    cy.get('[data-testid="expense-status"]')
      .should('contain', 'Pending approval');

    // Login as admin to approve
    cy.logout();
    cy.login('admin@example.com', 'password123');

    // Approve expense
    cy.get('[data-testid="expenses"]').click();
    cy.get('[data-testid="expense-item"]').first().click();
    cy.get('[data-testid="approve-expense"]').click();

    // Verify approval
    cy.get('[data-testid="expense-status"]')
      .should('contain', 'Approved');
  });
});
