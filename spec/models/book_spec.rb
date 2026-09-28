require 'rails_helper'

RSpec.describe Book, type: :model do
  describe "validations" do
    it { should validate_presence_of(:title) }
    it { should validate_presence_of(:author_name) }
    it { should validate_presence_of(:genre) }
    it { should validate_numericality_of(:published_year).only_integer }
  end

  describe ".filter_by" do
    let!(:dom_casmurro) { create(:book, title: "Dom Casmurro", author_name: "Machado de Assis", genre: "Romance", published_year: 1899) }
    let!(:duna) { create(:book, title: "Duna", author_name: "Frank Herbert", genre: "Ficção científica", published_year: 1965) }
    let!(:fundacao) { create(:book, title: "Fundação", author_name: "Isaac Asimov", genre: "Ficção científica", published_year: 1951) }

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

  describe "cover" do
    let(:book) { build(:book) }

    it "accepts a JPEG, PNG or WebP image" do
      book.cover.attach(io: file_fixture("cover.png").open, filename: "cover.png", content_type: "image/png")

      expect(book).to be_valid
    end

    it "rejects files that are not images" do
      book.cover.attach(io: file_fixture("not_an_image.txt").open, filename: "capa.txt", content_type: "text/plain")

      expect(book).not_to be_valid
      expect(book.errors[:cover]).to include("deve ser uma imagem JPEG, PNG ou WebP")
    end

    it "rejects images larger than 5 MB" do
      book.cover.attach(io: StringIO.new("a" * (5.megabytes + 1)), filename: "capa.png", content_type: "image/png")

      expect(book).not_to be_valid
      expect(book.errors[:cover]).to include("deve ter no máximo 5 MB")
    end
  end
end
