class Book < ApplicationRecord
  include Coverable, Genreable

  scope :title_contains, ->(title) { where("title ILIKE ?", "%#{sanitize_sql_like(title)}%") if title.present? }
  scope :author_contains, ->(author_name) { where("author_name ILIKE ?", "%#{sanitize_sql_like(author_name)}%") if author_name.present? }
  scope :published_from, ->(year) { where(published_year: year.to_i..) if year.to_s.match?(/\A\d+\z/) }
  scope :published_until, ->(year) { where(published_year: ..year.to_i) if year.to_s.match?(/\A\d+\z/) }
  scope :filter_by, ->(filters) {
    title_contains(filters[:title])
      .author_contains(filters[:author_name])
      .by_genre(filters[:genre])
      .published_from(filters[:year_from])
      .published_until(filters[:year_to])
  }

  validates :title, :author_name, presence: true
  validates :published_year, numericality: { only_integer: true }
end
