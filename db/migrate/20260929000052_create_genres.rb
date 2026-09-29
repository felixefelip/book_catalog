class CreateGenres < ActiveRecord::Migration[8.1]
  def change
    create_table :genres do |t|
      t.string :name, null: false

      t.timestamps
    end
    add_index :genres, "lower(name)", unique: true, name: "index_genres_on_lower_name"

    create_table :book_genres do |t|
      t.references :book, null: false, foreign_key: true, index: false
      t.references :genre, null: false, foreign_key: true
    end
    add_index :book_genres, %i[book_id genre_id], unique: true
  end
end
