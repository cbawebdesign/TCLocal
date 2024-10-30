import organizationPageObject from '../../support/organization.po';

describe(`Create Organization`, () => {
  const defaultOrganizationId =
    organizationPageObject.getDefaultOrganizationId();

  it('should be able to create a new organization', () => {
    const organizationName = Array.from({ length: 8 }, () =>
      String.fromCharCode(Math.random() * 26 + 97),
    ).join('');

    cy.signIn(`/dashboard`);

    organizationPageObject.createOrganization(organizationName);

    organizationPageObject
      .$currentOrganization()
      .should('contain', organizationName);

    cy.getCookie('organizationId').should(
      'not.have.property',
      'value',
      defaultOrganizationId,
    );
  });
});
