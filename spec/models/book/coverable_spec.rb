require 'rails_helper'

RSpec.describe Book::Coverable, type: :model do
  describe "validations" do
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

  describe "Open Library cover" do
    let(:client) { instance_double(OpenLibrary::Client) }
    let(:cover) { { io: file_fixture("cover.png").open, filename: "open-library-647501.jpg", content_type: "image/png" } }

    before do
      allow(OpenLibrary::Client).to receive(:new).and_return(client)
      allow(client).to receive(:cover).with(647501).and_return(cover)
    end

    it "attaches the Open Library cover when saving" do
      book = create(:book, open_library_cover_id: "647501")

      expect(book.cover).to be_attached
      expect(book.cover.filename.to_s).to eq("open-library-647501.jpg")
    end

    it "replaces the cover of a persisted book" do
      book = create(:book)
      book.cover.attach(io: file_fixture("cover.png").open, filename: "old.png", content_type: "image/png")

      book.update!(open_library_cover_id: 647501)

      expect(book.reload.cover.filename.to_s).to eq("open-library-647501.jpg")
    end

    it "prefers an uploaded cover" do
      book = build(:book, open_library_cover_id: 647501)
      book.cover.attach(io: file_fixture("cover.png").open, filename: "upload.png", content_type: "image/png")

      book.save!

      expect(book.cover.filename.to_s).to eq("upload.png")
      expect(client).not_to have_received(:cover)
    end

    it "saves the book without a cover when the download fails" do
      allow(client).to receive(:cover).and_raise(OpenLibrary::Client::Error)

      book = create(:book, open_library_cover_id: 647501)

      expect(book).to be_persisted
      expect(book.cover).not_to be_attached
    end

    it "ignores ids that are not positive integers" do
      [ "", "abc", "12abc", "-1", "0", nil ].each do |id|
        expect(build(:book, open_library_cover_id: id).open_library_cover_id).to be_nil
      end

      create(:book, open_library_cover_id: "abc")

      expect(client).not_to have_received(:cover)
    end
  end
end
