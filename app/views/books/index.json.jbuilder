json.books @books do |book|
  json.extract! book, :id, :title, :published_year, :description
  json.authors book.author_names
  json.genres book.genre_names
  json.cover_url(book.cover_url && URI.join(request.base_url, book.cover_url).to_s)
  json.url book_url(book)
  json.created_at book.created_at
end

json.pagination do
  json.current_page @books.current_page
  json.total_pages @books.total_pages
  json.total_count @books.total_count
end
