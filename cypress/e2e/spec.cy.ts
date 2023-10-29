describe('Secret Santa Generator', () => {
  it('has title', () => {
    cy.visit('/');
    const expectedTitle = 'Secret Santa';
    cy.contains(expectedTitle);
    cy.get('input').should('have.value', 'Nick');
  });
});
