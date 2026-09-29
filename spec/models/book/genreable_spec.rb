require 'rails_helper'

RSpec.describe Book::Genreable, type: :model do
  subject { build(:book) }

  it "allows a book without genres" do
    expect(build(:book, genre_names: [])).to be_valid
  end

  describe "associations" do
    it { should have_many(:book_genres).dependent(:destroy) }
    it { should have_many(:genres).through(:book_genres) }
  end

  describe "#genre_names=" do
    it "reuses existing genres ignoring case and creates the missing ones" do
      romance = create(:genre, name: "Romance")

      book = create(:book, genre_names: [ " romance ", "Realismo", "", "REALISMO" ])

      expect(book.genres).to include(romance)
      expect(book.reload.genre_names).to eq([ "Realismo", "Romance" ])
      expect(Genre.count).to eq(2)
    end

    it "replaces the genres of a persisted book" do
      book = create(:book, genre_names: [ "Romance", "Drama" ])

      book.update!(genre_names: [ "Drama" ])

      expect(book.reload.genre_names).to eq([ "Drama" ])
    end
  end
end
