import organizationPageObject from '../../support/organization.po';

describe(`Delete Organization`, () => {
  describe(`When the user is an owner`, () => {
    it(`should be able to delete the organization`, () => {
      const path = `/${organizationPageObject.getDefaultOrganizationId()}/dashboard`;
      cy.signIn(path);

      const orgName = `Org ${Math.random()}`;
      organizationPageObject.createOrganization(orgName);

      cy.visit('/settings/organization').wait(500);

      organizationPageObject.$getDeleteOrganizationButton().click();
      organizationPageObject.$getDeleteOrganizationConfirmInput().type(orgName);

      organizationPageObject
        .$getConfirmDeleteOrganizationButton()
        .wait(100)
        .click();

      cy.visit(path);
      organizationPageObject.$currentOrganization().click();

      cy.contains('[data-cy="organization-selector-item"]', orgName).should(
        'not.exist',
      );
    });
  });
});
