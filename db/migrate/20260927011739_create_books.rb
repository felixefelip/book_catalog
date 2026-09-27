class CreateBooks < ActiveRecord::Migration[8.1]
  def change
    create_table :books do |t|
      t.string :title, null: false
      t.string :author_name, null: false
      t.integer :published_year, null: false
      t.string :genre, null: false
      t.string :description

      t.timestamps
    end
  end
end
