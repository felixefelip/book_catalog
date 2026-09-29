class Genre < ApplicationRecord
  has_many :book_genres, dependent: :destroy
  has_many :books, through: :book_genres

  normalizes :name, with: ->(name) { name.squish }

  validates :name, presence: true, uniqueness: { case_sensitive: false }

  scope :in_use, -> { where(id: BookGenre.select(:genre_id)) }

  def self.find_or_initialize_by_name(name)
    where("lower(name) = ?", name.downcase).first || new(name: name)
  end
end
