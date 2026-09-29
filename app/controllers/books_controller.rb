# frozen_string_literal: true

class BooksController < InertiaController
  allow_unauthenticated_access only: %i[index show]
  before_action :set_book, only: %i[show edit update destroy]

  def index
    filters = params.permit(:title, :author_name, :genre, :year_from, :year_to).compact_blank.to_h
    books = Book.with_attached_cover.includes(:genres).filter_by(filters).order(created_at: :desc, id: :desc).page(params[:page])

    return redirect_to books_path(filters.merge(page: books.total_pages)) if books.out_of_range? && books.total_pages.positive?

    render inertia: {
      books: books.map { |book| serialize_book(book) },
      pagination: {
        current_page: books.current_page,
        total_pages: books.total_pages,
        total_count: books.total_count
      },
      filters: filters,
      genres: genre_names
    }
  end

  def show
    render inertia: {
      book: serialize_book(@book).merge(
        "creator_name" => @book.creator.full_name,
        "created_on" => l(@book.created_at.to_date)
      )
    }
  end

  def new
    render inertia: { book: serialize_book(Book.new) }
  end

  def edit
    render inertia: { book: serialize_book(@book) }
  end

  def create
    @book = Current.user.books.new(book_params)

    if @book.save
      redirect_to books_path, notice: t(".success")
    else
      redirect_to new_book_path, inertia: { errors: @book.errors.to_hash(true) }
    end
  end

  def update
    if @book.update(book_params)
      redirect_to books_path, notice: t(".success")
    else
      redirect_to edit_book_path(@book), inertia: { errors: @book.errors.to_hash(true) }
    end
  end

  def destroy
    @book.destroy!
    redirect_to books_path, notice: t(".success"), status: :see_other
  end

  private
    def set_book
      @book = Book.find(params[:id])
    end

    def book_params
      params.expect(book: [ :title, :author_name, :published_year, :description, :open_library_cover_id, genre_names: [] ])
    end

    def genre_names
      Genre.in_use.order(:name).pluck(:name)
    end

    def serialize_book(book)
      book.as_json(only: %i[id title author_name published_year description]).merge(
        "genres" => book.genre_names,
        "cover_url" => (url_for(book.cover.variant(:thumb)) if book.cover.attached?)
      )
    end
end
