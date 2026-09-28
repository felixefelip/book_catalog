class Book < ApplicationRecord
  COVER_CONTENT_TYPES = %w[image/jpeg image/png image/webp].freeze
  COVER_MAX_SIZE = 5.megabytes

  has_one_attached :cover do |attachable|
    attachable.variant :thumb, resize_to_limit: [ 300, 450 ]
  end

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
