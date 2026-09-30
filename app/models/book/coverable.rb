module Book::Coverable
  extend ActiveSupport::Concern

  CONTENT_TYPES = %w[image/jpeg image/png image/webp].freeze
  MAX_SIZE = 5.megabytes

  included do
    has_one_attached :cover do |attachable|
      attachable.variant :thumb, resize_to_limit: [ 300, 450 ]
    end

    validates :pending_open_library_cover_id, numericality: { only_integer: true, greater_than: 0 }, allow_nil: true
    validate :cover_must_be_a_valid_image
    after_save_commit :attach_open_library_cover_later, if: :open_library_cover_requested?
  end

  def cover_pending?
    pending_open_library_cover_id.present?
  end

  def cover_url
    if cover_pending?
      OpenLibrary::Client.cover_url(pending_open_library_cover_id)
    elsif cover.attached?
      Rails.application.routes.url_helpers.rails_representation_path(cover.variant(:thumb), only_path: true)
    end
  end

  def attach_open_library_cover_now
    return unless cover_pending?

    image = OpenLibrary::Client.new.cover(pending_open_library_cover_id)

    update!(cover: image, pending_open_library_cover_id: nil)
  end

  private
    def open_library_cover_requested?
      saved_change_to_pending_open_library_cover_id? && cover_pending?
    end

    def attach_open_library_cover_later
      Book::AttachOpenLibraryCoverJob.perform_later(self)
    end

    def cover_must_be_a_valid_image
      return unless cover.attached?

      errors.add(:cover, :invalid_content_type) unless cover.content_type.in?(CONTENT_TYPES)
      errors.add(:cover, :too_large, count: MAX_SIZE / 1.megabyte) if cover.byte_size > MAX_SIZE
    end
end
