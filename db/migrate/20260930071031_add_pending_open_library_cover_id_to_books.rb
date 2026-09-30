class AddPendingOpenLibraryCoverIdToBooks < ActiveRecord::Migration[8.1]
  def change
    add_column :books, :pending_open_library_cover_id, :bigint
  end
end
