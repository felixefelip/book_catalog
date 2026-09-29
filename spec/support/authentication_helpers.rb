module AuthenticationHelpers
  def sign_in_as(user)
    post session_path, params: { email_address: user.email_address, password: "password" }
  end
end

module SystemAuthenticationHelpers
  def sign_in_as(user)
    visit new_session_path
    fill_in "E-mail", with: user.email_address
    fill_in "Senha", with: "password"
    click_button "Entrar"
    expect(page).to have_button(user.full_name)
  end
end

RSpec.configure do |config|
  config.include AuthenticationHelpers, type: :request
  config.include SystemAuthenticationHelpers, type: :system
end
