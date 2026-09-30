require 'rails_helper'

RSpec.describe Book::AttachOpenLibraryCoverJob, type: :job do
  let(:book) { create(:book) }

  it "attaches the Open Library cover to the book" do
    allow(book).to receive(:attach_open_library_cover_now)

    described_class.perform_now(book)

    expect(book).to have_received(:attach_open_library_cover_now)
  end

  it "retries when Open Library is unavailable" do
    allow(book).to receive(:attach_open_library_cover_now).and_raise(OpenLibrary::Client::Error)

    expect { described_class.perform_now(book) }.to have_enqueued_job(described_class)
  end
end
