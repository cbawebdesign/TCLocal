import authPo from '../support/auth.po';
import organizationPo from '../support/organization.po';
import configuration from '~/configuration';
import { MembershipRole } from '~/lib/organizations/types/membership-role';
import organizationPageObject from '../support/organization.po';

describe(`Onboarding Flow`, () => {
  it('should complete onboarding', () => {
    cy.visit('/auth/sign-up');

    const email = `onboarding-${Date.now()}@example.com`;
    const invitedEmail = `invited-${Date.now()}@example.com`;
    const password = 'password';

    authPo.signUpWithEmailAndPassword(email, password);

    cy.url().should('include', configuration.paths.onboarding);

    cy.cyGet(`organization-name-input`).type(`Acme`);
    cy.get(`button[type="submit"]`).click();

    organizationPo.$getInvitationEmailInput().clear().type(invitedEmail);
    organizationPo.selectRole(MembershipRole.Admin);

    cy.get(`button[type="submit"]`).click();
    cy.cyGet('complete-onboarding-link').click();

    cy.url().should('include', configuration.paths.appHome);

    cy.contains('Settings').click().wait(100);
    cy.contains('Organization').click().wait(100);
    cy.contains('Pending Invites').click();

    organizationPageObject.$getInvitedMemberByEmail(invitedEmail).within(() => {
      organizationPageObject.$getRoleBadge().should('have.text', `Admin`);
    });
  });
});
