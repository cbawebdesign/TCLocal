import stripePo from '../../support/stripe.po';
import organizationPo from '../../support/organization.po';

describe(`Create Subscription`, () => {
  let organization: string;

  describe('Using the UI', () => {
    describe('The session should be created successfully', () => {
      it('should redirect to the success page', () => {
        organization = `Stripe ${Date.now()}`;
        cy.signIn(`/settings/subscription`);

        organizationPo.createOrganization(organization);
        cy.contains('Subscription').click();

        stripePo.selectPlan(0);
        stripePo.$fillForm();
        stripePo.$cardForm().submit();

        cy.url().should('include', '/settings/subscription/return?session_id=');
        cy.cyGet('payment-return-success').should('exist');

        // wait for webhook to fire
        cy.wait(2000);

        cy.visit(`/settings/subscription`);
        stripePo.verifyCreateSubscriptionElements();
        stripePo.$manageBillingButton().should('exist');
        stripePo.$assertStatus('active');
      });
    });
  });
});
