require 'rails_helper'

RSpec.describe Genre, type: :model do
  describe "associations" do
    it { should have_many(:book_genres).dependent(:destroy) }
    it { should have_many(:books).through(:book_genres) }
  end

  describe "validations" do
    subject { build(:genre) }

    it { should validate_presence_of(:name) }
    it { should validate_uniqueness_of(:name).case_insensitive }
  end

  it "squishes the name" do
    expect(create(:genre, name: "  Ficção   científica ").name).to eq("Ficção científica")
  end

  describe ".find_or_initialize_by_name" do
    it "finds an existing genre ignoring case" do
      genre = create(:genre, name: "Romance")

      expect(Genre.find_or_initialize_by_name("ROMANCE")).to eq(genre)
    end

    it "builds a new genre when none matches" do
      expect(Genre.find_or_initialize_by_name("Drama")).to be_new_record.and have_attributes(name: "Drama")
    end
  end

  describe ".name_contains" do
    it "matches part of the name ignoring case and treating wildcards literally" do
      romance = create(:genre, name: "Romance")
      create(:genre, name: "Drama")

      expect(Genre.name_contains("MAN")).to contain_exactly(romance)
      expect(Genre.name_contains("%")).to be_empty
    end
  end

  describe ".in_use" do
    it "returns only genres with books" do
      create(:book, genre_names: [ "Romance" ])
      create(:genre, name: "Drama")

      expect(Genre.in_use.pluck(:name)).to eq([ "Romance" ])
    end
  end
end
