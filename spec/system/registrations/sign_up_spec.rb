require "rails_helper"

RSpec.describe "Signing up", type: :system do
  def fill_in_registration(email_address:, password_confirmation: "password123")
    fill_in "Nome", with: "Clarice"
    fill_in "Sobrenome", with: "Lispector"
    fill_in "E-mail", with: email_address
    fill_in "Senha", with: "password123"
    fill_in "Confirmação da senha", with: password_confirmation
  end

  it "creates the account and signs the user in" do
    visit root_path
    click_link "Criar conta"

    fill_in_registration(email_address: "Clarice@Example.com ")
    click_button "Criar conta"

    expect(page).to have_text("Conta criada com sucesso.")
    expect(page).to have_current_path(root_path)
    expect(page).to have_button("Clarice Lispector")

    expect(User.last).to have_attributes(name: "Clarice", last_name: "Lispector", email_address: "clarice@example.com")
  end

  it "shows the validation errors and keeps the filled data except the passwords" do
    create(:user, email_address: "clarice@example.com")
    visit new_registration_path

    fill_in_registration(email_address: "clarice@example.com", password_confirmation: "other-password")
    click_button "Criar conta"

    expect(page).to have_text("E-mail já está em uso")
    expect(page).to have_text("Confirmação da senha não é igual a Senha")
    expect(page).to have_current_path(new_registration_path)
    expect(page).to have_field("Nome", with: "Clarice")
    expect(page).to have_field("E-mail", with: "clarice@example.com")
    expect(page).to have_field("Senha", with: "")
    expect(page).to have_field("Confirmação da senha", with: "")
    expect(User.count).to eq(1)
  end

  it "links to the sign in page" do
    visit new_registration_path

    click_link "Já tem conta? Entrar"

    expect(page).to have_current_path(new_session_path)
    expect(page).to have_button("Entrar")
  end
end
