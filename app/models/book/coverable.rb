module Book::Coverable
  extend ActiveSupport::Concern

  CONTENT_TYPES = %w[image/jpeg image/png image/webp].freeze
  MAX_SIZE = 5.megabytes

  included do
    has_one_attached :cover do |attachable|
      attachable.variant :thumb, resize_to_limit: [ 300, 450 ]
    end

    attr_reader :open_library_cover_id

    before_validation :attach_open_library_cover, if: :open_library_cover_pending?
    validate :cover_must_be_a_valid_image
  end

  def open_library_cover_id=(id)
    @open_library_cover_id = Integer(id, exception: false)&.then { it if it.positive? }
  end

  private
    def open_library_cover_pending?
      open_library_cover_id.present? && !attachment_changes.key?("cover")
    end

    def attach_open_library_cover
      self.cover = OpenLibrary::Client.new.cover(open_library_cover_id)
    rescue OpenLibrary::Client::Error => error
      Rails.logger.warn("Open Library cover #{open_library_cover_id} not attached: #{error.message}")
    ensure
      @open_library_cover_id = nil
    end

    def cover_must_be_a_valid_image
      return unless cover.attached?

      errors.add(:cover, :invalid_content_type) unless cover.content_type.in?(CONTENT_TYPES)
      errors.add(:cover, :too_large, count: MAX_SIZE / 1.megabyte) if cover.byte_size > MAX_SIZE
    end
end
