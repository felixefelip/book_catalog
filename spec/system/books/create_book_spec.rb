require "rails_helper"

RSpec.describe "Creating a book", type: :system do
  let(:user) { create(:user) }
  let(:client) { instance_double(OpenLibrary::Client) }
  let(:dom_casmurro) do
    {
      id: "OL1003040W",
      title: "Dom Casmurro",
      authors: [ "Machado de Assis" ],
      published_year: 1899,
      subjects: [ "Romance", "Literatura brasileira" ],
      cover_id: nil,
      cover_url: nil
    }
  end

  before do
    allow(OpenLibrary::Client).to receive(:new).and_return(client)
    allow(client).to receive(:search).with("Dom Casmurro").and_return([ dom_casmurro ])
    allow(client).to receive(:description).with("OL1003040W").and_return("Bentinho e Capitu.")
  end

  it "creates a book chosen from Open Library" do
    sign_in_as(user)

    click_link "Novo livro"
    fill_in "Título", with: "Dom Casmurro"
    find("[role=option]", text: "Machado de Assis · 1899").click

    expect(page).to have_field("Autores", with: "Machado de Assis", readonly: true)
    expect(page).to have_field("Ano de publicação", with: "1899", readonly: true)
    expect(page).to have_field("Descrição", with: "Bentinho e Capitu.", readonly: true)
    expect(page).to have_text("Literatura brasileira")

    click_button "Cadastrar livro"

    expect(page).to have_text("Livro cadastrado com sucesso.")
    expect(page).to have_current_path(books_path)
    expect(page).to have_link("Dom Casmurro")

    book = Book.last
    expect(book).to have_attributes(title: "Dom Casmurro", published_year: 1899, description: "Bentinho e Capitu.", creator: user)
    expect(book.author_names).to eq([ "Machado de Assis" ])
    expect(book.genre_names).to contain_exactly("Romance", "Literatura brasileira")
  end

  it "tells the user when Open Library is unavailable" do
    allow(client).to receive(:search).and_raise(OpenLibrary::Client::Error)
    sign_in_as(user)

    visit new_book_path
    fill_in "Título", with: "Dom Casmurro"

    expect(page).to have_text("Não foi possível consultar a Open Library.")
    expect(page).to have_button("Cadastrar livro", disabled: true)
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
