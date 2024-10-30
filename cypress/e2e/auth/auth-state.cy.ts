import configuration from '~/configuration';

describe('Auth State', () => {
  describe('When the user is not logged in', () => {
    describe('And visits a gated paged', () => {
      it('Should be redirected to the login page', () => {
        const targetLink = configuration.paths.settings.profile;

        cy.visit(targetLink);
        cy.url().should('include', configuration.paths.signIn);
        cy.url().should('include', `signOut=true`);

        cy.url().should(
          'include',
          `returnUrl=${encodeURIComponent(targetLink)}`,
        );
      });
    });
  });

  describe('When the user is logged in', () => {
    describe('And visits a gated paged', () => {
      it('Should be able to access the page', () => {
        const targetLink = configuration.paths.settings.profile;

        cy.signIn(targetLink);
        cy.url().should('include', targetLink);
      });
    });

    describe('And the session token expires/invalidates', () => {
      it('Should be redirected to the login page', () => {
        interceptSignOut(() => {
          cy.signIn(configuration.paths.appHome);
          cy.clearCookie('session');
          cy.contains('Subscription').click();
        });

        cy.url().should('include', configuration.paths.signIn);
        cy.url().should('include', `signOut=true`);

        cy.url().should(
          'include',
          `returnUrl=${encodeURIComponent(
            configuration.paths.settings.subscription,
          )}`,
        );
      });
    });
  });
});

function interceptSignOut(cb: () => void) {
  cy.intercept('POST', '/api/session/sign-out').as('signOut');

  cb();

  cy.wait('@signOut');
}
