class Author < ApplicationRecord
  has_many :book_authors, dependent: :destroy
  has_many :books, through: :book_authors

  normalizes :name, with: ->(name) { name.squish }

  validates :name, presence: true, uniqueness: { case_sensitive: false }

  scope :in_use, -> { where(id: BookAuthor.select(:author_id)) }
  scope :name_contains, ->(query) { where("name ILIKE ?", "%#{sanitize_sql_like(query)}%") if query.present? }

  def self.find_or_initialize_by_name(name)
    where("lower(name) = ?", name.downcase).first || new(name: name)
  end
end
