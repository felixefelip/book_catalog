class Book < ApplicationRecord
  validates :title, :author_name, :genre, presence: true
  validates :published_year, numericality: { only_integer: true }
end
