describe('My First Test', () => {
  it('Visits the initial project page', () => {
    cy.visit('/');
    const expectedTitle = 'Secret Santa';
    cy.contains(expectedTitle);
    cy.get('input').should('have.value', 'Nick');
  });
});
