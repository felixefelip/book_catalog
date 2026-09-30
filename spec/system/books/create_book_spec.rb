require "rails_helper"

RSpec.describe "Creating a book", type: :system do
  let(:user) { create(:user) }
  let(:dom_casmurro) do
    {
      key: "/works/OL1003040W",
      title: "Dom Casmurro",
      author_name: [ "Machado de Assis" ],
      first_publish_year: 1899,
      subject: [ "Romance", "Literatura brasileira" ]
    }
  end

  before do
    stub_open_library_search(docs: [ dom_casmurro ])
    stub_open_library_work(work_id: "OL1003040W", body: { description: "Bentinho e Capitu." })
  end

  it "creates a book chosen from Open Library" do
    sign_in_as(user)

    click_link "Novo livro"
    fill_in "Título", with: "Dom Casmurro"
    find("[role=option]", text: "Machado de Assis · 1899").click

    expect(page).to have_css("[data-slot=combobox-chip]", text: "Machado de Assis")
    expect(page).to have_field("Ano de publicação", with: "1899")
    expect(page).to have_field("Descrição", with: "Bentinho e Capitu.")
    expect(page).to have_css("[data-slot=combobox-chip]", text: "Literatura brasileira")

    click_button "Cadastrar livro"

    expect(page).to have_text("Livro cadastrado com sucesso.")
    expect(page).to have_current_path(books_path)
    expect(page).to have_link("Dom Casmurro")

    book = Book.last
    expect(book).to have_attributes(title: "Dom Casmurro", published_year: 1899, description: "Bentinho e Capitu.", creator: user)
    expect(book.author_names).to eq([ "Machado de Assis" ])
    expect(book.genre_names).to contain_exactly("Romance", "Literatura brasileira")
  end

  it "creates a book typed by hand with authors and genres that do not exist yet" do
    create(:book, author_names: [ "Machado de Assis" ])
    sign_in_as(user)

    visit new_book_path
    fill_in "Título", with: "Livro inédito"
    fill_in "Autores", with: "Machado"
    find("[role=option]", text: "Machado de Assis").click
    fill_in "Autores", with: "Autora Nova"
    find("[role=option]", text: 'Adicionar "Autora Nova"').click
    fill_in "Gêneros", with: "Gênero Novo"
    find("[role=option]", text: 'Adicionar "Gênero Novo"').click
    fill_in "Ano de publicação", with: "2026"
    fill_in "Descrição", with: "Escrito à mão."

    click_button "Cadastrar livro"

    expect(page).to have_text("Livro cadastrado com sucesso.")

    book = Book.find_by!(title: "Livro inédito")
    expect(book).to have_attributes(published_year: 2026, description: "Escrito à mão.", creator: user)
    expect(book.author_names).to eq([ "Machado de Assis", "Autora Nova" ])
    expect(book.genre_names).to eq([ "Gênero Novo" ])
    expect(Author.where(name: "Machado de Assis").count).to eq(1)
  end

  it "lets the user fill the book by hand when Open Library is unavailable" do
    stub_open_library_search_failure
    sign_in_as(user)

    visit new_book_path
    fill_in "Título", with: "Dom Casmurro"

    expect(page).to have_text("Não foi possível consultar a Open Library.")
    expect(page).to have_button("Cadastrar livro", disabled: false)
  end

  it "asks guests to sign in before creating a book" do
    visit new_book_path

    expect(page).to have_current_path(new_session_path)

    fill_in "E-mail", with: user.email_address
    fill_in "Senha", with: "password"
    click_button "Entrar"

    expect(page).to have_current_path(new_book_path)
    expect(page).to have_field("Título")
  end
end
