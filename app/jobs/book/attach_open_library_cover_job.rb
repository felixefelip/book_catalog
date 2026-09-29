class Book::AttachOpenLibraryCoverJob < ApplicationJob
  retry_on OpenLibrary::Client::Error, wait: :polynomially_longer, attempts: 3
  discard_on ActiveJob::DeserializationError

  def perform(book, cover_id)
    book.attach_open_library_cover_now(cover_id)
  end
end
