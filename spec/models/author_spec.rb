require 'rails_helper'

RSpec.describe Author, type: :model do
  describe "associations" do
    it { should have_many(:book_authors).dependent(:destroy) }
    it { should have_many(:books).through(:book_authors) }
  end

  describe "validations" do
    subject { Author.new(name: "Machado de Assis") }

    it { should validate_presence_of(:name) }
    it { should validate_uniqueness_of(:name).case_insensitive }
  end

  it "squishes the name" do
    expect(Author.create!(name: "  Machado   de Assis ").name).to eq("Machado de Assis")
  end

  describe ".find_or_initialize_by_name" do
    it "finds an existing author ignoring case" do
      author = Author.create!(name: "Machado de Assis")

      expect(Author.find_or_initialize_by_name("MACHADO DE ASSIS")).to eq(author)
    end

    it "builds a new author when none matches" do
      expect(Author.find_or_initialize_by_name("Clarice Lispector")).to be_new_record.and have_attributes(name: "Clarice Lispector")
    end
  end

  describe ".name_contains" do
    it "matches part of the name ignoring case and treating wildcards literally" do
      machado = Author.create!(name: "Machado de Assis")
      Author.create!(name: "Clarice Lispector")

      expect(Author.name_contains("ASSIS")).to contain_exactly(machado)
      expect(Author.name_contains("%")).to be_empty
    end
  end

  describe ".in_use" do
    it "returns only authors with books" do
      create(:book, author_names: [ "Machado de Assis" ])
      Author.create!(name: "Clarice Lispector")

      expect(Author.in_use.pluck(:name)).to eq([ "Machado de Assis" ])
    end
  end
end
