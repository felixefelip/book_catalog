require 'rails_helper'

RSpec.describe "Books", type: :request do
  let(:user) { create(:user) }

  before { sign_in_as(user) }

  let(:valid_params) do
    {
      book: {
        title: "Dom Casmurro",
        author_name: "Machado de Assis",
        published_year: 1899,
        genre: "Romance",
        description: "Bentinho e Capitu."
      }
    }
  end

  describe "GET /" do
    it "renders the books list as the home page" do
      get root_path

      expect_inertia.to render_component("books/index")
    end
  end

  describe "GET /books" do
    it "includes the cover thumbnail url" do
      book = create(:book)
      book.cover.attach(fixture_file_upload("cover.png", "image/png"))

      get books_path

      expect(inertia.props[:books].first["cover_url"]).to include("cover.png")
    end

    it "lists the books ordered by title" do
      create(:book, title: "Memórias Póstumas de Brás Cubas")
      create(:book, title: "Dom Casmurro")

      get books_path

      expect_inertia.to render_component("books/index")
      expect(inertia.props[:books].map { |book| book["title"] })
        .to eq([ "Dom Casmurro", "Memórias Póstumas de Brás Cubas" ])
    end

    it "renders an empty list when there are no books" do
      get books_path

      expect(inertia.props[:books]).to eq([])
    end
  end

  describe "GET /books/:id" do
    it "renders the book page" do
      book = create(:book, description: "Um guia sobre design orientado a objetos.")

      get book_path(book)

      expect_inertia.to render_component("books/show")
      expect(inertia.props[:book]).to include(
        "id" => book.id,
        "title" => book.title,
        "description" => "Um guia sobre design orientado a objetos."
      )
    end
  end

  describe "GET /books/new" do
    it "renders the new book page" do
      get new_book_path

      expect_inertia.to render_component("books/new")
      expect(inertia.props[:book]).to include("id" => nil, "title" => nil)
    end

    it "shares the current locale" do
      get new_book_path

      expect(inertia.props[:locale]).to eq("pt-BR")
    end
  end

  describe "POST /books" do
    context "with valid params" do
      it "creates the book and redirects to the list" do
        expect { post books_path, params: valid_params }.to change(Book, :count).by(1)

        expect(response).to redirect_to(books_path)
        expect(Book.last).to have_attributes(title: "Dom Casmurro", published_year: 1899)
        expect(Book.last.cover).not_to be_attached

        follow_redirect!
        expect_inertia.to have_flash(notice: "Livro cadastrado com sucesso.")
      end
    end

    context "with a cover" do
      it "attaches the cover" do
        post books_path, params: { book: valid_params[:book].merge(cover: fixture_file_upload("cover.png", "image/png")) }

        expect(Book.last.cover).to be_attached
      end
    end

    context "with a cover that is not an image" do
      it "does not create the book and redirects back with the error" do
        expect {
          post books_path, params: {
            book: valid_params[:book].merge(cover: fixture_file_upload("not_an_image.txt", "text/plain"))
          }
        }.not_to change(Book, :count)

        follow_redirect!
        expect(inertia.props[:errors]).to include("cover" => [ "Capa deve ser uma imagem JPEG, PNG ou WebP" ])
      end
    end

    context "with invalid params" do
      it "does not create the book and redirects back with translated errors" do
        expect {
          post books_path, params: { book: valid_params[:book].merge(title: "", published_year: "abc") }
        }.not_to change(Book, :count)

        expect(response).to redirect_to(new_book_path)

        follow_redirect!
        expect_inertia.to render_component("books/new")
        expect(inertia.props[:errors]).to include(
          "title" => [ "Título não pode ficar em branco" ],
          "published_year" => [ "Ano de publicação não é um número" ]
        )
      end
    end
  end

  describe "GET /books/:id/edit" do
    it "renders the edit page with the book" do
      book = create(:book)

      get edit_book_path(book)

      expect_inertia.to render_component("books/edit")
      expect(inertia.props[:book]).to include("id" => book.id, "title" => book.title)
    end
  end

  describe "PATCH /books/:id" do
    let(:book) { create(:book) }

    context "when the book has a cover" do
      before { book.cover.attach(fixture_file_upload("cover.png", "image/png")) }

      it "keeps the cover when no new file is sent" do
        patch book_path(book), params: { book: { title: "99 Bottles of OOP" } }

        expect(book.reload.cover).to be_attached
      end

      it "replaces the cover when a new file is sent" do
        old_blob = book.cover.blob

        patch book_path(book), params: { book: { cover: fixture_file_upload("cover.png", "image/png") } }

        expect(book.reload.cover.blob).not_to eq(old_blob)
      end
    end

    context "with valid params" do
      it "updates the book and redirects to the list" do
        patch book_path(book), params: { book: { title: "99 Bottles of OOP" } }

        expect(response).to redirect_to(books_path)
        expect(book.reload.title).to eq("99 Bottles of OOP")

        follow_redirect!
        expect_inertia.to have_flash(notice: "Livro atualizado com sucesso.")
      end
    end

    context "with invalid params" do
      it "does not update the book and redirects back with translated errors" do
        patch book_path(book), params: { book: { author_name: "" } }

        expect(response).to redirect_to(edit_book_path(book))
        expect(book.reload.author_name).to eq("Sandi Metz")

        follow_redirect!
        expect(inertia.props[:errors]).to include("author_name" => [ "Autor não pode ficar em branco" ])
      end
    end
  end

  describe "DELETE /books/:id" do
    let!(:book) { create(:book) }

    it "deletes the book and redirects to the list" do
      expect { delete book_path(book) }.to change(Book, :count).by(-1)

      expect(response).to redirect_to(books_path)
      expect(response).to have_http_status(:see_other)

      follow_redirect!
      expect_inertia.to have_flash(notice: "Livro excluído com sucesso.")
    end

    it "removes the cover" do
      book.cover.attach(fixture_file_upload("cover.png", "image/png"))

      expect { delete book_path(book) }.to have_enqueued_job(ActiveStorage::PurgeJob)
    end
  end

  context "when not signed in" do
    before { delete session_path }

    it "lists the books without a current user" do
      create(:book, title: "Dom Casmurro")

      get books_path

      expect_inertia.to render_component("books/index")
      expect(inertia.props[:books].map { |book| book["title"] }).to eq([ "Dom Casmurro" ])
      expect(inertia.props[:current_user]).to be_nil
    end

    it "shows a book without a current user" do
      book = create(:book)

      get book_path(book)

      expect_inertia.to render_component("books/show")
      expect(inertia.props[:current_user]).to be_nil
    end

    it "redirects to the sign in page when accessing other pages" do
      get new_book_path

      expect(response).to redirect_to(new_session_path)
    end

    it "does not delete books" do
      book = create(:book)

      expect { delete book_path(book) }.not_to change(Book, :count)
      expect(response).to redirect_to(new_session_path)
    end
  end
end
