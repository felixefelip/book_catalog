require "rails_helper"

RSpec.describe "Resetting a password", type: :system do
  include ActiveJob::TestHelper

  let(:user) { create(:user) }

  def reset_link_path
    email = ActionMailer::Base.deliveries.last
    expect(email.to).to eq([ user.email_address ])

    URI(email.text_part.body.to_s[%r{http://\S+/passwords/\S+}]).path
  end

  def request_reset_link
    visit new_session_path
    click_link "Esqueceu a senha?"
    fill_in "E-mail", with: user.email_address

    perform_enqueued_jobs do
      click_button "Enviar instruções"
      expect(page).to have_text("Se existir uma conta com esse e-mail, enviaremos as instruções para redefinir a senha.")
    end
    expect(page).to have_current_path(new_session_path)
  end

  it "resets the password through the emailed link and signs in with the new one" do
    request_reset_link

    visit reset_link_path
    fill_in "Nova senha", with: "new-password"
    fill_in "Confirmação da senha", with: "new-password"
    click_button "Salvar"

    expect(page).to have_text("Senha redefinida com sucesso.")
    expect(page).to have_current_path(new_session_path)

    fill_in "E-mail", with: user.email_address
    fill_in "Senha", with: "new-password"
    click_button "Entrar"

    expect(page).to have_button(user.full_name)
  end

  it "shows the validation errors when the confirmation does not match" do
    request_reset_link

    visit reset_link_path
    fill_in "Nova senha", with: "new-password"
    fill_in "Confirmação da senha", with: "other-password"
    click_button "Salvar"

    expect(page).to have_text("Confirmação da senha não é igual a Senha")
    expect(page).to have_field("Nova senha", with: "")
    expect(user.reload.authenticate("password")).to be_truthy
  end

  it "does not reveal whether the email exists" do
    visit new_password_path
    fill_in "E-mail", with: "unknown@example.com"

    perform_enqueued_jobs do
      click_button "Enviar instruções"
      expect(page).to have_text("Se existir uma conta com esse e-mail, enviaremos as instruções para redefinir a senha.")
    end
    expect(ActionMailer::Base.deliveries).to be_empty
  end

  it "rejects an invalid token" do
    visit edit_password_path("invalid-token")

    expect(page).to have_text("O link de redefinição de senha é inválido ou expirou.")
    expect(page).to have_current_path(new_password_path)
  end
end
