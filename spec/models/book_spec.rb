require 'rails_helper'

RSpec.describe Book, type: :model do
  describe "validations" do
    it { should validate_presence_of(:title) }
    it { should validate_numericality_of(:published_year).only_integer.allow_nil }
  end

  it "stores blank author and description as nil" do
    book = create(:book, author_name: "  ", description: "")

    expect(book).to have_attributes(author_name: nil, description: nil)
  end

  describe ".filter_by" do
    let!(:dom_casmurro) { create(:book, title: "Dom Casmurro", author_name: "Machado de Assis", genre_names: [ "Romance" ], published_year: 1899) }
    let!(:duna) { create(:book, title: "Duna", author_name: "Frank Herbert", genre_names: [ "Ficção científica" ], published_year: 1965) }
    let!(:fundacao) { create(:book, title: "Fundação", author_name: "Isaac Asimov", genre_names: [ "Ficção científica" ], published_year: 1951) }

    it "returns every book when no filter is given" do
      expect(Book.filter_by({})).to contain_exactly(dom_casmurro, duna, fundacao)
    end

    it "filters by part of the title ignoring case" do
      expect(Book.filter_by(title: "casm")).to contain_exactly(dom_casmurro)
    end

    it "filters by part of the author name ignoring case" do
      expect(Book.filter_by(author_name: "HERBERT")).to contain_exactly(duna)
    end

    it "treats LIKE wildcards as literal characters" do
      expect(Book.filter_by(title: "%")).to be_empty
    end

    it "filters by one of the genres" do
      realismo = create(:book, title: "Memórias Póstumas", genre_names: [ "Romance", "Realismo" ])

      expect(Book.filter_by(genre: "Realismo")).to contain_exactly(realismo)
      expect(Book.filter_by(genre: "Romance")).to contain_exactly(dom_casmurro, realismo)
    end

    it "filters by the exact genre" do
      expect(Book.filter_by(genre: "Ficção científica")).to contain_exactly(duna, fundacao)
    end

    it "filters by a published year range" do
      expect(Book.filter_by(year_from: "1950", year_to: "1960")).to contain_exactly(fundacao)
    end

    it "ignores years that are not numbers" do
      expect(Book.filter_by(year_from: "abc")).to contain_exactly(dom_casmurro, duna, fundacao)
    end

    it "combines filters" do
      expect(Book.filter_by(genre: "Ficção científica", year_from: "1960")).to contain_exactly(duna)
    end
  end
end
