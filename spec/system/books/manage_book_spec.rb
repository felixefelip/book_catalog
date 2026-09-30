require "rails_helper"

RSpec.describe "Managing a book", type: :system do
  let(:owner) { create(:user) }
  let!(:book) do
    create(:book, title: "Dom Casmurro", author_names: [ "Machado de Assis" ], genre_names: [ "Romance" ],
      published_year: 1899, description: "Bentinho e Capitu.", creator: owner)
  end

  describe "editing" do
    let(:client) { instance_double(OpenLibrary::Client) }
    let(:memorias) do
      {
        id: "OL1003041W",
        title: "Memórias Póstumas de Brás Cubas",
        authors: [ "Machado de Assis" ],
        published_year: 1881,
        subjects: [ "Romance", "Realismo" ],
        cover_id: nil,
        cover_url: nil
      }
    end

    before do
      allow(OpenLibrary::Client).to receive(:new).and_return(client)
      allow(client).to receive(:search).with("Memórias Póstumas").and_return([ memorias ])
      allow(client).to receive(:description).with("OL1003041W").and_return("Ao verme que primeiro roeu.")
    end

    it "replaces the book with another one chosen from Open Library" do
      sign_in_as(owner)

      click_link "Dom Casmurro"
      click_link "Editar"

      expect(page).to have_field("Título", with: "Dom Casmurro")

      fill_in "Título", with: "Memórias Póstumas"
      find("[role=option]", text: "Machado de Assis · 1881").click

      expect(page).to have_field("Ano de publicação", with: "1881", readonly: true)

      click_button "Salvar alterações"

      expect(page).to have_text("Livro atualizado com sucesso.")
      expect(page).to have_current_path(books_path)
      expect(page).to have_link("Memórias Póstumas de Brás Cubas")
      expect(page).to have_no_link("Dom Casmurro")

      expect(book.reload).to have_attributes(title: "Memórias Póstumas de Brás Cubas", published_year: 1881,
        description: "Ao verme que primeiro roeu.")
      expect(book.genre_names).to contain_exactly("Romance", "Realismo")
    end
  end

  describe "deleting" do
    before do
      sign_in_as(owner)
      click_link "Dom Casmurro"
      click_button "Excluir"
    end

    it "deletes the book after confirming" do
      within("[role=alertdialog]") { click_button "Excluir" }

      expect(page).to have_text("Livro excluído com sucesso.")
      expect(page).to have_current_path(books_path)
      expect(page).to have_text("Nenhum livro cadastrado.")
      expect(Book.exists?(book.id)).to be(false)
    end

    it "keeps the book when cancelling" do
      within("[role=alertdialog]") { click_button "Cancelar" }

      expect(page).to have_no_css("[role=alertdialog]")
      expect(page).to have_current_path(book_path(book))
      expect(Book.exists?(book.id)).to be(true)
    end
  end

  describe "authorization" do
    it "hides the actions from users who did not create the book" do
      sign_in_as(create(:user))

      expect(page).to have_link("Dom Casmurro")
      expect(page).to have_no_link("Editar")

      click_link "Dom Casmurro"

      expect(page).to have_text("Bentinho e Capitu.")
      expect(page).to have_no_link("Editar")
      expect(page).to have_no_button("Excluir")
    end

    it "redirects users who open the edit page of a book they did not create" do
      sign_in_as(create(:user))

      visit edit_book_path(book)

      expect(page).to have_text("Você só pode alterar livros cadastrados por você.")
      expect(page).to have_current_path(books_path)
    end

    it "hides the actions from guests" do
      visit book_path(book)

      expect(page).to have_text("Bentinho e Capitu.")
      expect(page).to have_no_link("Editar")
      expect(page).to have_no_button("Excluir")
    end
  end
end
