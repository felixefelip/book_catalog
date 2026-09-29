require 'rails_helper'

RSpec.describe "Authors", type: :request do
  describe "GET /authors" do
    it "lists the authors in use ordered by name" do
      create(:book, author_names: [ "Machado de Assis", "Clarice Lispector" ])
      Author.create!(name: "Sem livros")

      get authors_path

      expect(response.parsed_body).to eq("names" => [ "Clarice Lispector", "Machado de Assis" ], "next_page" => nil)
    end

    it "searches authors by part of the name ignoring case" do
      create(:book, author_names: [ "Machado de Assis", "Clarice Lispector" ])

      get authors_path, params: { q: "ASSIS" }

      expect(response.parsed_body["names"]).to eq([ "Machado de Assis" ])
    end

    it "paginates the authors" do
      create(:book, author_names: (1..25).map { |n| format("Author %02d", n) })

      get authors_path

      expect(response.parsed_body["names"].size).to eq(20)
      expect(response.parsed_body["next_page"]).to eq(2)

      get authors_path, params: { page: 2 }

      expect(response.parsed_body["names"]).to eq((21..25).map { |n| format("Author %02d", n) })
      expect(response.parsed_body["next_page"]).to be_nil
    end
  end
end
