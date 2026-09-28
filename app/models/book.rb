class Book < ApplicationRecord
  COVER_CONTENT_TYPES = %w[image/jpeg image/png image/webp].freeze
  COVER_MAX_SIZE = 5.megabytes

  has_one_attached :cover do |attachable|
    attachable.variant :thumb, resize_to_limit: [ 300, 450 ]
  end

  scope :title_contains, ->(title) { where("title ILIKE ?", "%#{sanitize_sql_like(title)}%") if title.present? }
  scope :author_contains, ->(author_name) { where("author_name ILIKE ?", "%#{sanitize_sql_like(author_name)}%") if author_name.present? }
  scope :by_genre, ->(genre) { where(genre: genre) if genre.present? }
  scope :published_from, ->(year) { where(published_year: year.to_i..) if year.to_s.match?(/\A\d+\z/) }
  scope :published_until, ->(year) { where(published_year: ..year.to_i) if year.to_s.match?(/\A\d+\z/) }
  scope :filter_by, ->(filters) {
    title_contains(filters[:title])
      .author_contains(filters[:author_name])
      .by_genre(filters[:genre])
      .published_from(filters[:year_from])
      .published_until(filters[:year_to])
  }

  validates :title, :author_name, :genre, presence: true
  validates :published_year, numericality: { only_integer: true }
  validate :cover_must_be_a_valid_image

  private
    def cover_must_be_a_valid_image
      return unless cover.attached?

      errors.add(:cover, :invalid_content_type) unless cover.content_type.in?(COVER_CONTENT_TYPES)
      errors.add(:cover, :too_large, count: COVER_MAX_SIZE / 1.megabyte) if cover.byte_size > COVER_MAX_SIZE
    end
end
