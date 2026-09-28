require 'rails_helper'

RSpec.describe "Passwords", type: :request do
  let(:user) { create(:user) }

  describe "GET /passwords/new" do
    it "renders the forgot password page" do
      get new_password_path

      expect_inertia.to render_component("passwords/new")
    end
  end

  describe "POST /passwords" do
    it "sends the reset instructions" do
      expect {
        post passwords_path, params: { email_address: user.email_address }
      }.to have_enqueued_mail(PasswordsMailer, :reset)

      expect(response).to redirect_to(new_session_path)
    end

    it "does not reveal unknown email addresses" do
      expect {
        post passwords_path, params: { email_address: "ninguem@example.com" }
      }.not_to have_enqueued_mail

      follow_redirect!
      expect_inertia.to have_flash(
        notice: "Se existir uma conta com esse e-mail, enviaremos as instruções para redefinir a senha."
      )
    end
  end

  describe "GET /passwords/:token/edit" do
    it "renders the reset page with the token" do
      token = user.password_reset_token

      get edit_password_path(token)

      expect_inertia.to render_component("passwords/edit")
      expect(inertia.props[:token]).to eq(token)
    end

    it "redirects when the token is invalid" do
      get edit_password_path("invalid")

      expect(response).to redirect_to(new_password_path)
    end
  end

  describe "PUT /passwords/:token" do
    let(:token) { user.password_reset_token }

    it "updates the password" do
      put password_path(token), params: { password: "new-password", password_confirmation: "new-password" }

      expect(response).to redirect_to(new_session_path)
      expect(user.reload.authenticate("new-password")).to be_truthy
    end

    it "redirects back with translated errors when the confirmation does not match" do
      put password_path(token), params: { password: "new-password", password_confirmation: "other" }

      expect(response).to redirect_to(edit_password_path(token))

      follow_redirect!
      expect(inertia.props[:errors]).to include(
        "password_confirmation" => [ "Confirmação da senha não é igual a Senha" ]
      )
    end
  end
end
