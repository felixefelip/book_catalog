require 'rails_helper'

RSpec.describe "Registrations", type: :request do
  let(:valid_params) do
    { name: "Clarice", last_name: "Lispector", email_address: "leitor@example.com", password: "password", password_confirmation: "password" }
  end

  describe "GET /registration/new" do
    it "renders the sign up page" do
      get new_registration_path

      expect_inertia.to render_component("registrations/new")
    end
  end

  describe "POST /registration" do
    context "with valid params" do
      it "creates the user, signs in and redirects to the home page" do
        expect { post registration_path, params: valid_params }.to change(User, :count).by(1)

        expect(response).to redirect_to(root_path)

        follow_redirect!
        expect_inertia.to have_flash(notice: "Conta criada com sucesso.")
        expect(inertia.props[:current_user]).to include("name" => "Clarice", "last_name" => "Lispector", "email_address" => "leitor@example.com")
      end
    end

    context "with invalid params" do
      it "does not create the user and redirects back with translated errors" do
        create(:user, email_address: "leitor@example.com")

        expect {
          post registration_path, params: valid_params.merge(name: "", password_confirmation: "other")
        }.not_to change(User, :count)

        expect(response).to redirect_to(new_registration_path)

        follow_redirect!
        expect_inertia.to render_component("registrations/new")
        expect(inertia.props[:errors]).to include(
          "name" => [ "Nome não pode ficar em branco" ],
          "email_address" => [ "E-mail já está em uso" ],
          "password_confirmation" => [ "Confirmação da senha não é igual a Senha" ]
        )
      end
    end
  end
end
