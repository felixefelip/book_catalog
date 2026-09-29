class CreateBooks < ActiveRecord::Migration[8.1]
  def change
    create_table :books do |t|
      t.string :title, null: false
      t.string :author_name
      t.integer :published_year
      t.string :description

      t.timestamps
    end
  end
end
