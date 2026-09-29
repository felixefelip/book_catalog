class CreateAuthors < ActiveRecord::Migration[8.1]
  def change
    create_table :authors do |t|
      t.string :name, null: false

      t.timestamps
    end
    add_index :authors, "lower(name)", unique: true, name: "index_authors_on_lower_name"

    create_table :book_authors do |t|
      t.references :book, null: false, foreign_key: true, index: false
      t.references :author, null: false, foreign_key: true
    end
    add_index :book_authors, %i[book_id author_id], unique: true
  end
end
