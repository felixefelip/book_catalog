require 'rails_helper'

RSpec.describe "Sessions", type: :request do
  let(:user) { create(:user, email_address: "leitor@example.com") }

  describe "GET /session/new" do
    it "renders the sign in page" do
      get new_session_path

      expect_inertia.to render_component("sessions/new")
    end
  end

  describe "POST /session" do
    it "signs in and redirects to the page requested before" do
      get books_path
      post session_path, params: { email_address: user.email_address, password: "password" }

      expect(response).to redirect_to(books_url)

      follow_redirect!
      expect(inertia.props[:current_user]).to eq(
        "id" => user.id, "name" => "Machado", "last_name" => "de Assis", "email_address" => "leitor@example.com"
      )
    end

    it "redirects back with an alert when the credentials are invalid" do
      post session_path, params: { email_address: user.email_address, password: "wrong" }

      expect(response).to redirect_to(new_session_path)

      follow_redirect!
      expect_inertia.to have_flash(alert: "E-mail ou senha inválidos.")
    end
  end

  describe "DELETE /session" do
    it "signs out" do
      sign_in_as(user)

      expect { delete session_path }.to change(Session, :count).by(-1)
      expect(response).to redirect_to(new_session_path)
      expect(response).to have_http_status(:see_other)
    end
  end
end
