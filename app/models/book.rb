class Book < ApplicationRecord
  include Authorable, Coverable, Genreable

  belongs_to :creator, class_name: "User"

  normalizes :description, with: ->(value) { value.strip.presence }

  scope :title_contains, ->(title) { where("title ILIKE ?", "%#{sanitize_sql_like(title)}%") if title.present? }
  scope :published_from, ->(year) { where(published_year: year.to_i..) if year.to_s.match?(/\A\d+\z/) }
  scope :published_until, ->(year) { where(published_year: ..year.to_i) if year.to_s.match?(/\A\d+\z/) }
  scope :created_by, ->(user) { where(creator: user) if user }
  scope :filter_by, ->(filters) {
    title_contains(filters[:title])
      .by_authors(filters[:authors])
      .by_genres(filters[:genres])
      .published_from(filters[:year_from])
      .published_until(filters[:year_to])
      .created_by(filters[:creator])
  }

  validates :title, presence: true
  validates :published_year, numericality: { only_integer: true }, allow_nil: true
end
