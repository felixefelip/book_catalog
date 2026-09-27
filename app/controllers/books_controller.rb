# frozen_string_literal: true

class BooksController < InertiaController
  before_action :set_book, only: %i[edit update]

  def index
    render inertia: { books: Book.order(:title).map { |book| serialize_book(book) } }
  end

  def new
    render inertia: { book: serialize_book(Book.new) }
  end

  def edit
    render inertia: { book: serialize_book(@book) }
  end

  def create
    @book = Book.new(book_params)

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

  private
    def set_book
      @book = Book.find(params[:id])
    end

    def book_params
      params.expect(book: %i[title author_name published_year genre description])
    end

    def serialize_book(book)
      book.as_json(only: %i[id title author_name published_year genre description])
    end
end
