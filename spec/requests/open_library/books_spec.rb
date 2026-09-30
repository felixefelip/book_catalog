# require "rails_helper"

# RSpec.describe "OpenLibrary::Books", type: :request do
#   let(:client) { instance_double(OpenLibrary::Client) }

#   before do
#     allow(OpenLibrary::Client).to receive(:new).and_return(client)
#   end

#   context "when signed in" do
#     before { sign_in_as(create(:user)) }

#     describe "GET /open_library/books" do
#       it "returns the search results" do
#         allow(client).to receive(:search).with("dom casmurro")
#           .and_return([ { id: "OL1003040W", title: "Dom Casmurro" } ])

#         get open_library_books_path, params: { q: " dom casmurro " }

#         expect(response).to have_http_status(:ok)
#         expect(response.parsed_body).to eq([ { "id" => "OL1003040W", "title" => "Dom Casmurro" } ])
#       end

#       it "skips the search when the query is too short" do
#         allow(client).to receive(:search)

#         get open_library_books_path, params: { q: "do" }

#         expect(response.parsed_body).to eq([])
#         expect(client).not_to have_received(:search)
#       end

#       it "returns bad gateway when Open Library is unavailable" do
#         allow(client).to receive(:search).and_raise(OpenLibrary::Client::Error)

#         get open_library_books_path, params: { q: "dom casmurro" }

#         expect(response).to have_http_status(:bad_gateway)
#         expect(response.parsed_body["error"]).to be_present
#       end
#     end

#     describe "GET /open_library/books/:id" do
#       it "returns the work description" do
#         allow(client).to receive(:description).with("OL1003040W").and_return("Bentinho e Capitu.")

#         get open_library_book_path("OL1003040W")

#         expect(response.parsed_body).to eq("description" => "Bentinho e Capitu.")
#       end
#     end
#   end

#   context "when signed out" do
#     it "redirects to sign in" do
#       get open_library_books_path, params: { q: "dom casmurro" }

#       expect(response).to redirect_to(new_session_path)
#     end
#   end
# end
