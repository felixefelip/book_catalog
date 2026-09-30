class Book::AttachOpenLibraryCoverJob < ApplicationJob
  retry_on OpenLibrary::Client::Error, wait: :polynomially_longer, attempts: 3
  discard_on ActiveJob::DeserializationError

  def perform(book)
    book.attach_open_library_cover_now
  end
end
