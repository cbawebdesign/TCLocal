import authPo from '../../support/auth.po';
import profilePo from '../../support/profile.po';
import auth from '../../support/auth.po';

describe(`Delete Account`, () => {
  let email: string;
  let password: string;

  function setupUser() {
    email = `delete-account-${Date.now()}@example.com`;
    password = authPo.getDefaultUserPassword();

    authPo.interceptSession(() => {
      cy.visit('/auth/sign-up');
      authPo.signUpWithEmailAndPassword(email, password);
    });

    cy.completeOnboarding(email, password);
    cy.visit('/settings/profile');
  }

  describe(`When the user deletes their account`, () => {
    it(`should delete the user's account`, () => {
      setupUser();

      profilePo.deleteAccount();
    });

    it(`should not be able to sign in with the deleted account`, () => {
      cy.visit('/auth/sign-in');

      authPo.signInWithEmailAndPassword(email, password);
      auth.$getErrorMessage().should('exist');
    });
  });
});
