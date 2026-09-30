require 'rails_helper'

RSpec.describe "Books", type: :request do
  let(:user) { create(:user) }

  before { sign_in_as(user) }

  let(:valid_params) do
    {
      book: {
        title: "Dom Casmurro",
        author_names: [ "Machado de Assis" ],
        published_year: 1899,
        genre_names: [ "Romance", "Realismo" ],
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

    it "lists the most recently created books first" do
      create(:book, title: "Dom Casmurro", created_at: 2.days.ago)
      create(:book, title: "Quincas Borba", created_at: 1.day.ago)
      create(:book, title: "Memórias Póstumas de Brás Cubas", created_at: 3.days.ago)

      get books_path

      expect_inertia.to render_component("books/index")
      expect(inertia.props[:books].map { |book| book["title"] })
        .to eq([ "Quincas Borba", "Dom Casmurro", "Memórias Póstumas de Brás Cubas" ])
    end

    it "breaks ties in the creation date by the most recent id" do
      created_at = 1.day.ago
      create(:book, title: "Dom Casmurro", created_at: created_at)
      create(:book, title: "Quincas Borba", created_at: created_at)

      get books_path

      expect(inertia.props[:books].map { |book| book["title"] }).to eq([ "Quincas Borba", "Dom Casmurro" ])
    end

    it "filters the books by the given params" do
      create(:book, title: "Dom Casmurro", genre_names: [ "Romance" ])
      create(:book, title: "Duna", genre_names: [ "Ficção científica" ])

      get books_path, params: { title: "dun", genres: [ "Ficção científica", "" ], authors: [ "" ] }

      expect(inertia.props[:books].map { |book| book["title"] }).to eq([ "Duna" ])
      expect(inertia.props[:filters]).to eq("title" => "dun", "genres" => [ "Ficção científica" ])
    end

    it "filters the books created by the current user" do
      create(:book, title: "Dom Casmurro", creator: user)
      create(:book, title: "Duna")

      get books_path, params: { mine: "1" }

      expect(inertia.props[:books].map { |book| book["title"] }).to eq([ "Dom Casmurro" ])
      expect(inertia.props[:filters]).to eq("mine" => "1")
    end

    it "includes the genres of each book" do
      create(:book, genre_names: [ "Romance", "Drama" ])

      get books_path

      expect(inertia.props[:books].first["genres"]).to eq([ "Drama", "Romance" ])
    end

    it "includes the total number of books regardless of the filters" do
      create(:book, title: "Dom Casmurro", genre_names: [])
      create(:book, title: "Duna", genre_names: [])

      get books_path, params: { title: "dun" }

      expect(inertia.props[:books].size).to eq(1)
      expect(inertia.props[:books_count]).to eq(2)
    end

    it "filters the books by any of the selected authors" do
      create(:book, title: "Dom Casmurro", author_names: [ "Machado de Assis" ])
      create(:book, title: "Duna", author_names: [ "Frank Herbert" ])
      create(:book, title: "Clean Code", author_names: [ "Robert C. Martin" ])

      get books_path, params: { authors: [ "Machado de Assis", "Frank Herbert" ] }

      expect(inertia.props[:books].map { |book| book["title"] }).to contain_exactly("Dom Casmurro", "Duna")
      expect(inertia.props[:books].first["authors"]).to be_one
    end

    it "filters the books by any of the selected genres" do
      create(:book, title: "Dom Casmurro", genre_names: [ "Romance" ])
      create(:book, title: "Duna", genre_names: [ "Ficção científica" ])
      create(:book, title: "Clean Code", genre_names: [ "Programação" ])

      get books_path, params: { genres: [ "Romance", "Ficção científica" ] }

      expect(inertia.props[:books].map { |book| book["title"] }).to contain_exactly("Dom Casmurro", "Duna")
    end

    context "with more books than fit in a page" do
      before do
        create_list(:book, 12)
        create(:book, title: "Dom Casmurro", created_at: 1.year.ago)
      end

      it "returns the first page with the pagination data" do
        get books_path

        expect(inertia.props[:books].size).to eq(12)
        expect(inertia.props[:pagination]).to eq("current_page" => 1, "total_pages" => 2, "total_count" => 13)
      end

      it "returns the requested page" do
        get books_path, params: { page: 2 }

        expect(inertia.props[:books].map { |book| book["title"] }).to eq([ "Dom Casmurro" ])
        expect(inertia.props[:pagination]).to include("current_page" => 2)
      end

      it "paginates only the filtered books" do
        get books_path, params: { title: "Casmurro" }

        expect(inertia.props[:books].map { |book| book["title"] }).to eq([ "Dom Casmurro" ])
        expect(inertia.props[:pagination]).to eq("current_page" => 1, "total_pages" => 1, "total_count" => 1)
      end

      it "redirects to the last page keeping the filters when the page is out of range" do
        get books_path, params: { title: "Practical", page: 5 }

        expect(response).to redirect_to(books_path(title: "Practical", page: 1))
      end
    end

    it "renders an empty page when there are no books" do
      get books_path, params: { page: 3 }

      expect(inertia.props[:books]).to eq([])
      expect(inertia.props[:pagination]).to include("total_pages" => 0, "total_count" => 0)
    end

    it "renders an empty list when there are no books" do
      get books_path

      expect(inertia.props[:books]).to eq([])
    end
  end

  describe "GET /books/:id" do
    it "allows the creator to update and destroy the book" do
      book = create(:book, creator: user)

      get book_path(book)

      expect(inertia.props[:book]["can"]).to eq("update" => true, "destroy" => true)
    end

    it "does not allow other users to update or destroy the book" do
      book = create(:book)

      get book_path(book)

      expect(inertia.props[:book]["can"]).to eq("update" => false, "destroy" => false)
    end

    it "renders the book page" do
      book = create(:book, description: "Um guia sobre design orientado a objetos.")

      get book_path(book)

      expect_inertia.to render_component("books/show")
      expect(inertia.props[:book]).to include(
        "id" => book.id,
        "title" => book.title,
        "description" => "Um guia sobre design orientado a objetos.",
        "creator_name" => "Machado de Assis",
        "created_on" => I18n.l(book.created_at.to_date)
      )
    end
  end

  describe "GET /books/new" do
    it "renders the new book page" do
      get new_book_path

      expect_inertia.to render_component("books/new")
      expect(inertia.props[:book]).to include("id" => nil, "title" => nil, "genres" => [])
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

        created_book = Book.last!
        expect(created_book).to have_attributes(title: "Dom Casmurro", published_year: 1899)
        expect(created_book.author_names).to eq([ "Machado de Assis" ])
        expect(created_book.genre_names).to eq([ "Realismo", "Romance" ])
        expect(created_book.creator).to eq(user)
        expect(created_book.cover).not_to be_attached

        follow_redirect!
        expect_inertia.to have_flash(notice: "Livro cadastrado com sucesso.")
      end
    end

    context "with an Open Library cover" do
      it "enqueues the cover download" do
        expect {
          post books_path, params: { book: valid_params[:book].merge(pending_open_library_cover_id: "647501") }
        }.to have_enqueued_job(Book::AttachOpenLibraryCoverJob).with(instance_of(Book))
      end
    end

    context "with an uploaded cover" do
      it "attaches the image" do
        post books_path, params: { book: valid_params[:book].merge(cover: fixture_file_upload("cover.png", "image/png")) }

        expect(Book.last!.cover.filename.to_s).to eq("cover.png")
      end

      it "redirects back with the error when the file is not an image" do
        expect {
          post books_path, params: { book: valid_params[:book].merge(cover: fixture_file_upload("not_an_image.txt", "text/plain")) }
        }.not_to change(Book, :count)

        follow_redirect!
        expect(inertia.props[:errors]).to include("cover" => [ "Capa deve ser uma imagem JPEG, PNG ou WebP" ])
      end
    end

    context "with a work without author, year, description or genres" do
      it "creates the book with only the title" do
        post books_path, params: {
          book: { title: "Dom Casmurro", author_names: [], published_year: nil, description: nil, genre_names: [] }
        }, as: :json

        created_book = Book.last!
        expect(created_book).to have_attributes(title: "Dom Casmurro", published_year: nil, description: nil)
        expect(created_book.authors).to be_empty
        expect(created_book.genres).to be_empty
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
      book = create(:book, creator: user)

      get edit_book_path(book)

      expect_inertia.to render_component("books/edit")
      expect(inertia.props[:book]).to include("id" => book.id, "title" => book.title)
    end

    it "redirects to the list when the book was created by someone else" do
      book = create(:book)

      get edit_book_path(book)

      expect(response).to redirect_to(books_path)

      follow_redirect!
      expect_inertia.to have_flash(alert: "Você só pode alterar livros cadastrados por você.")
    end
  end

  describe "PATCH /books/:id" do
    let(:book) { create(:book, creator: user) }

    it "does not update a book created by someone else" do
      book = create(:book)

      patch book_path(book), params: { book: { title: "99 Bottles of OOP" } }

      expect(response).to redirect_to(books_path)
      expect(book.reload.title).to eq("Practical Object-Oriented Design: An Agile Primer Using Ruby")
    end

    context "when the book has a cover" do
      before { book.cover.attach(fixture_file_upload("cover.png", "image/png")) }

      it "keeps the cover when no Open Library cover is sent" do
        patch book_path(book), params: { book: { title: "99 Bottles of OOP" } }

        expect(book.reload.cover).to be_attached
      end

      it "enqueues the new cover download when the work has a cover" do
        expect {
          patch book_path(book), params: { book: { pending_open_library_cover_id: "647501" } }
        }.to have_enqueued_job(Book::AttachOpenLibraryCoverJob).with(book)
      end

      it "keeps the cover when the Open Library cover id is null" do
        patch book_path(book), params: { book: { pending_open_library_cover_id: nil } }, as: :json

        expect(book.reload.cover).to be_attached
      end

      it "clears a pending Open Library cover when an image is uploaded" do
        book.update!(pending_open_library_cover_id: 647501)

        patch book_path(book), params: { book: { cover: fixture_file_upload("cover.png", "image/png"), pending_open_library_cover_id: "" } }

        expect(book.reload).not_to be_cover_pending
        expect(book.cover.filename.to_s).to eq("cover.png")
      end

      it "replaces the cover with an uploaded image" do
        patch book_path(book), params: { book: { cover: fixture_file_upload("cover.png", "image/png") } }

        expect(response).to redirect_to(books_path)
        expect(book.reload.cover.blob.filename.to_s).to eq("cover.png")
      end

      it "removes the cover when it is sent blank" do
        patch book_path(book), params: { book: { cover: "" } }

        expect(book.reload.cover).not_to be_attached
      end

      it "removes the cover when it is sent as null" do
        patch book_path(book), params: { book: { cover: nil } }, as: :json

        expect(book.reload.cover).not_to be_attached
      end
    end

    it "clears the authors and genres sent as blank inside a multipart form" do
      patch book_path(book), params: { book: { author_names: [ "" ], genre_names: [ "" ], cover: fixture_file_upload("cover.png", "image/png") } }

      expect(book.reload.authors).to be_empty
      expect(book.genres).to be_empty
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

    it "replaces the genres" do
      patch book_path(book), params: { book: { genre_names: [ "Refatoração", "Ruby" ] } }

      expect(book.reload.genre_names).to eq([ "Refatoração", "Ruby" ])
    end

    it "keeps the genres when none are sent" do
      patch book_path(book), params: { book: { title: "99 Bottles of OOP" } }

      expect(book.reload.genre_names).to eq([ "Programming" ])
    end

    it "removes the genres when the new work has none" do
      patch book_path(book), params: { book: { genre_names: [] } }, as: :json

      expect(book.reload.genres).to be_empty
    end

    context "with invalid params" do
      it "does not update the book and redirects back with translated errors" do
        patch book_path(book), params: { book: { title: "" } }

        expect(response).to redirect_to(edit_book_path(book))
        expect(book.reload.title).to eq("Practical Object-Oriented Design: An Agile Primer Using Ruby")

        follow_redirect!
        expect(inertia.props[:errors]).to include("title" => [ "Título não pode ficar em branco" ])
      end
    end
  end

  describe "DELETE /books/:id" do
    let!(:book) { create(:book, creator: user) }

    it "does not delete a book created by someone else" do
      other_book = create(:book)

      expect { delete book_path(other_book) }.not_to change(Book, :count)
      expect(response).to redirect_to(books_path)
    end

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

    it "ignores the filter of books created by the current user" do
      create(:book, title: "Dom Casmurro")

      get books_path, params: { mine: "1" }

      expect(inertia.props[:books].map { |book| book["title"] }).to eq([ "Dom Casmurro" ])
      expect(inertia.props[:filters]).to eq({})
    end

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
