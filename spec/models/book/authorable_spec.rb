require 'rails_helper'

RSpec.describe Book::Authorable, type: :model do
  subject { build(:book) }

  describe "associations" do
    it { should have_many(:book_authors).dependent(:destroy) }
    it { should have_many(:authors).through(:book_authors) }
  end

  it "allows a book without authors" do
    expect(build(:book, author_names: [])).to be_valid
  end

  describe "#author_names=" do
    it "reuses existing authors ignoring case and creates the missing ones" do
      machado = Author.create!(name: "Machado de Assis")

      book = create(:book, author_names: [ " machado de assis ", "Helen Caldwell", "", "HELEN CALDWELL" ])

      expect(book.authors).to include(machado)
      expect(Author.count).to eq(2)
    end

    it "keeps the authors in the given order" do
      book = create(:book, author_names: [ "Dave Thomas", "Andy Hunt" ])

      expect(book.reload.author_names).to eq([ "Dave Thomas", "Andy Hunt" ])
    end

    it "replaces the authors of a persisted book" do
      book = create(:book, author_names: [ "Andy Hunt", "Dave Thomas" ])

      book.update!(author_names: [ "Dave Thomas" ])

      expect(book.reload.author_names).to eq([ "Dave Thomas" ])
    end
  end
end
