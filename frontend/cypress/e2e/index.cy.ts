it('index title test', () => {
    const page = cy.visit('/');
  
    page.get('title').should('have.text', 'Home')
});