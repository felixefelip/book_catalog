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
    it "enqueues the cover download after saving" do
      expect { create(:book, open_library_cover_id: "647501") }
        .to have_enqueued_job(Book::AttachOpenLibraryCoverJob).with(instance_of(Book), 647501)
    end

    it "removes the current cover when the new work has none" do
      book = create(:book)
      book.cover.attach(io: file_fixture("cover.png").open, filename: "old.png", content_type: "image/png")

      expect { book.update!(open_library_cover_id: nil) }.to have_enqueued_job(ActiveStorage::PurgeJob)
    end

    it "leaves the cover alone when no Open Library cover is assigned" do
      book = create(:book)

      expect { book.update!(title: "99 Bottles of OOP") }
        .not_to have_enqueued_job(Book::AttachOpenLibraryCoverJob)
    end

    it "enqueues the download only once per assignment" do
      book = create(:book, open_library_cover_id: 647501)

      expect { book.update!(title: "99 Bottles of OOP") }
        .not_to have_enqueued_job(Book::AttachOpenLibraryCoverJob)
    end

    it "treats ids that are not positive integers as no cover" do
      [ "", "abc", "12abc", "-1", "0", nil ].each do |id|
        expect(build(:book, open_library_cover_id: id).open_library_cover_id).to be_nil
      end
    end

    it "downloads and attaches the cover" do
      client = instance_double(OpenLibrary::Client)
      allow(OpenLibrary::Client).to receive(:new).and_return(client)
      allow(client).to receive(:cover).with(647501)
        .and_return(io: file_fixture("cover.png").open, filename: "open-library-647501.jpg", content_type: "image/png")
      book = create(:book)

      book.attach_open_library_cover_now(647501)

      expect(book.reload.cover.filename.to_s).to eq("open-library-647501.jpg")
    end
  end
end
