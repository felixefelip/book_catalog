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
    it "enqueues the download after saving a pending cover" do
      expect { create(:book, pending_open_library_cover_id: 647501) }
        .to have_enqueued_job(Book::AttachOpenLibraryCoverJob).with(instance_of(Book))
    end

    it "clears the pending cover and leaves the current cover alone when it is set to nil" do
      book = create(:book, pending_open_library_cover_id: 647501)
      book.cover.attach(io: file_fixture("cover.png").open, filename: "old.png", content_type: "image/png")

      expect { book.update!(pending_open_library_cover_id: nil) }
        .not_to have_enqueued_job(Book::AttachOpenLibraryCoverJob)

      expect(book.reload).not_to be_cover_pending
      expect(book.cover).to be_attached
    end

    it "leaves the cover alone when no Open Library cover is assigned" do
      book = create(:book)

      expect { book.update!(title: "99 Bottles of OOP") }
        .not_to have_enqueued_job(Book::AttachOpenLibraryCoverJob)
    end

    it "enqueues the download only when the pending cover changes" do
      book = create(:book, pending_open_library_cover_id: 647501)

      expect { book.update!(title: "99 Bottles of OOP") }
        .not_to have_enqueued_job(Book::AttachOpenLibraryCoverJob)
      expect { book.update!(pending_open_library_cover_id: 647502) }
        .to have_enqueued_job(Book::AttachOpenLibraryCoverJob).with(book)
    end

    it "accepts only positive integers as the pending cover" do
      [ "abc", "12abc", "1.5", "-1", "0" ].each do |id|
        book = build(:book, pending_open_library_cover_id: id)

        expect(book).not_to be_valid
        expect(book.errors[:pending_open_library_cover_id]).to be_present
      end

      [ "647501", 647501, "", nil ].each do |id|
        expect(build(:book, pending_open_library_cover_id: id)).to be_valid
      end
    end

    describe "#attach_open_library_cover_now" do
      let(:book) { create(:book, pending_open_library_cover_id: 647501) }

      it "attaches the pending cover and clears it" do
        stub_open_library_cover(cover_id: 647501)

        book.attach_open_library_cover_now

        expect(book.reload.cover.filename.to_s).to eq("open-library-647501.jpg")
        expect(book.cover.content_type).to eq("image/png")
        expect(book).not_to be_cover_pending
      end

      it "does nothing when the cover is no longer pending" do
        book.update!(pending_open_library_cover_id: nil)

        book.attach_open_library_cover_now

        expect(WebMock).not_to have_requested(:get, /covers\.openlibrary\.org/)
        expect(book.reload.cover).not_to be_attached
      end
    end
  end

  describe "#cover_url" do
    let(:book) { create(:book) }

    it "is nil when there is no cover" do
      expect(book.cover_url).to be_nil
    end

    it "is the path of the thumbnail when the cover is attached" do
      book.cover.attach(io: file_fixture("cover.png").open, filename: "cover.png", content_type: "image/png")

      expect(book.cover_url).to start_with("/rails/active_storage/representations/").and end_with("/cover.png")
    end

    it "is the Open Library cover while it is being downloaded, even over the attached one" do
      book.cover.attach(io: file_fixture("cover.png").open, filename: "cover.png", content_type: "image/png")
      book.update!(pending_open_library_cover_id: 647501)

      expect(book.cover_url).to eq("https://covers.openlibrary.org/b/id/647501-M.jpg?default=false")
    end
  end

  describe "removing the cover" do
    let(:book) { create(:book) }

    before { book.cover.attach(io: file_fixture("cover.png").open, filename: "cover.png", content_type: "image/png") }

    it "purges the cover when it is set to blank" do
      expect { book.update!(cover: "") }.to have_enqueued_job(ActiveStorage::PurgeJob)

      expect(book.reload.cover).not_to be_attached
    end
  end
end
