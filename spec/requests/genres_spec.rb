require 'rails_helper'

RSpec.describe "Genres", type: :request do
  describe "GET /genres" do
    it "lists the genres in use ordered by name" do
      create(:book, genre_names: [ "Romance", "Fantasia" ])
      create(:genre, name: "Sem livros")

      get genres_path

      expect(response.parsed_body).to eq("genres" => [ "Fantasia", "Romance" ], "next_page" => nil)
    end

    it "searches genres by part of the name ignoring case" do
      create(:book, genre_names: [ "Ficção científica", "Romance" ])

      get genres_path, params: { q: "FIC" }

      expect(response.parsed_body["genres"]).to eq([ "Ficção científica" ])
    end

    it "paginates the genres" do
      create(:book, genre_names: (1..25).map { |n| format("Genre %02d", n) })

      get genres_path

      expect(response.parsed_body["genres"].size).to eq(20)
      expect(response.parsed_body["next_page"]).to eq(2)

      get genres_path, params: { page: 2 }

      expect(response.parsed_body["genres"]).to eq((21..25).map { |n| format("Genre %02d", n) })
      expect(response.parsed_body["next_page"]).to be_nil
    end
  end
end
