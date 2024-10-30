import organizationPageObject from '../../support/organization.po';
import authPo from '../../support/auth.po';

describe(`Leave Organization`, () => {
  describe(`When the user is an owner`, () => {
    it(`should not be able to leave the organization`, () => {
      const orgName = `Leave Organization Test ${Math.random()}`;

      cy.signUp(
        `/settings/organization`,
        {
          email: getRandomEmail(),
          password: authPo.getDefaultUserPassword(),
        },
        orgName,
      );

      organizationPageObject.$getLeaveOrganizationButton().should('not.exist');
    });
  });

  describe(`When the user is a member`, () => {
    it(`should be able to leave the organization`, () => {
      const email = getRandomEmail();

      cy.signIn(`/settings/organization/members/invite`);

      organizationPageObject.inviteMember(email);

      cy.clearCookies();
      cy.signOutSession();
      cy.reload();

      const mailbox = email.split('@')[0];
      const emailTask = cy.task<UnknownObject>('getInviteEmail', mailbox);

      emailTask.then((json) => {
        const html = (json.body as { html: string }).html;
        const el = document.createElement('html');
        el.innerHTML = html;

        const linkHref = el.querySelector('a')?.getAttribute('href');

        cy.visit(linkHref!, { failOnStatusCode: false });
      });

      cy.wait(500);

      cy.intercept('api/session/sign-in').as('signUp');
      authPo.signUpWithEmailAndPassword(email, 'anypass');
      cy.wait('@signUp');

      cy.signIn(`/settings/organization`, {
        email,
        password: 'anypass',
      });

      cy.wait(500);

      organizationPageObject.$getLeaveOrganizationButton().click();
      organizationPageObject.$getConfirmLeaveOrganizationButton().click();

      cy.url().should('contain', '/onboarding');
    });
  });
});

function getRandomEmail() {
  const random = Math.round(Math.random() * 1000);
  return `leave-organization-${random}@makerkit.dev`;
}
