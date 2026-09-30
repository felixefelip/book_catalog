require "rails_helper"

RSpec.describe "Filtering books", type: :system do
  let(:user) { create(:user) }

  before do
    create(:book, title: "Duna", author_names: [ "Frank Herbert" ], genre_names: [ "Ficção científica" ], published_year: 1965)
    create(:book, title: "Fundação", author_names: [ "Isaac Asimov" ], genre_names: [ "Ficção científica" ], published_year: 1951)
    create(:book, title: "Dom Casmurro", author_names: [ "Machado de Assis" ], genre_names: [ "Romance" ], published_year: 1899, creator: user)
  end

  def choose_option(field, text)
    fill_in field, with: text
    find("[role=option]", text: text).click
    find("body").send_keys(:escape)
  end

  def listed_titles
    all("li h2").map(&:text)
  end

  it "filters by title and publication years" do
    visit books_path

    fill_in "Título", with: "Du"
    click_button "Filtrar"

    expect(page).to have_text("1 de 3 livros")
    expect(listed_titles).to eq([ "Duna" ])
    expect(page).to have_current_path(/[?&]title=Du(&|$)/)

    click_link "Limpar filtros"
    fill_in "Publicado a partir de", with: "1900"
    fill_in "Publicado até", with: "1960"
    click_button "Filtrar"

    expect(page).to have_text("1 de 3 livros")
    expect(listed_titles).to eq([ "Fundação" ])
  end

  it "filters by authors and genres chosen from the remote options" do
    visit books_path

    choose_option "Gênero", "Ficção científica"
    click_button "Filtrar"

    expect(page).to have_text("2 de 3 livros")
    expect(listed_titles).to contain_exactly("Duna", "Fundação")

    choose_option "Autores", "Isaac Asimov"
    click_button "Filtrar"

    expect(page).to have_text("1 de 3 livros")
    expect(listed_titles).to eq([ "Fundação" ])
  end

  it "shows only the books created by the signed in user" do
    sign_in_as(user)

    check "Somente cadastrados por mim"
    click_button "Filtrar"

    expect(page).to have_text("1 de 3 livros")
    expect(listed_titles).to eq([ "Dom Casmurro" ])
  end

  it "tells when no book matches and clears the filters" do
    visit books_path

    fill_in "Título", with: "Inexistente"
    click_button "Filtrar"

    expect(page).to have_text("Nenhum livro encontrado.")

    click_link "Limpar filtros"

    expect(page).to have_current_path(books_path)
    expect(page).to have_field("Título", with: "")
    expect(listed_titles).to contain_exactly("Duna", "Fundação", "Dom Casmurro")
  end
end
