export const profilePo = {
  $getDisplayNameInput: () => cy.cyGet(`profile-display-name`),
  $getUpdateEmailForm: () => cy.cyGet(`update-email-form`),
  $getUpdateProfileForm: () => cy.cyGet(`update-profile-form`),
  $getUpdatePasswordForm: () => cy.cyGet('update-password-form'),
  $getNewEmailInput: () => cy.cyGet(`profile-new-email-input`),
  $getRepeatEmailInput: () => cy.cyGet(`profile-repeat-email-input`),
  $getUpdateEmailPasswordInput: () => cy.cyGet(`profile-password-input`),
  $getUpdateEmailErrorAlert: () => cy.cyGet(`update-email-error-alert`),
  $getUpdatePasswordErrorAlert: () => cy.cyGet(`update-password-error-alert`),
  $getCurrentPasswordInput: () => cy.cyGet(`current-password`),
  $getNewPasswordInput: () => cy.cyGet(`new-password`),
  $getRepeatNewPasswordInput: () => cy.cyGet(`repeat-new-password`),
  $getLinkProviderButton(providerId: string) {
    return cy.get(
      `[data-cy="auth-provider-button"][data-provider="${providerId}"]`,
    );
  },
  $getUnlinkProviderButton(providerId: string) {
    return cy.get(
      `[data-cy="unlink-provider-button"][data-provider="${providerId}"]`,
    );
  },
  $confirmUnlinkButton() {
    return cy.cyGet(`confirm-unlink-provider-button`);
  },
  $getDeleteAccountButton: () => cy.cyGet(`delete-account-button`),
  $confirmDeleteAccountButton: () => cy.cyGet(`confirm-delete-account-button`),
  $confirmDeleteAccountConfirmationInput: () =>
    cy.cyGet(`delete-account-input-field`),
  deleteAccount() {
    cy.intercept('DELETE', 'api/user', (req) => {
      req.continue((res) => {
        expect(res.statusCode).to.equal(200);
      });
    }).as('deleteAccount');

    this.$getDeleteAccountButton().click();
    this.$confirmDeleteAccountConfirmationInput().type('DELETE');
    this.$confirmDeleteAccountButton().click();

    cy.wait('@deleteAccount');
  },
};

export default profilePo;
