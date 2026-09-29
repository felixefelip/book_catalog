module Book::Coverable
  extend ActiveSupport::Concern

  CONTENT_TYPES = %w[image/jpeg image/png image/webp].freeze
  MAX_SIZE = 5.megabytes

  included do
    has_one_attached :cover do |attachable|
      attachable.variant :thumb, resize_to_limit: [ 300, 450 ]
    end

    attr_reader :open_library_cover_id

    validate :cover_must_be_a_valid_image
    after_save_commit :replace_cover_later, if: :open_library_cover_assigned?
  end

  def open_library_cover_id=(id)
    @open_library_cover_assigned = true
    @open_library_cover_id = Integer(id, exception: false)&.then { it if it.positive? }
  end

  def attach_open_library_cover_now(cover_id)
    cover.attach(OpenLibrary::Client.new.cover(cover_id))
  end

  private
    def open_library_cover_assigned?
      @open_library_cover_assigned
    end

    def replace_cover_later
      @open_library_cover_assigned = false

      if open_library_cover_id
        Book::AttachOpenLibraryCoverJob.perform_later(self, open_library_cover_id)
      else
        cover.purge_later
      end
    end

    def cover_must_be_a_valid_image
      return unless cover.attached?

      errors.add(:cover, :invalid_content_type) unless cover.content_type.in?(CONTENT_TYPES)
      errors.add(:cover, :too_large, count: MAX_SIZE / 1.megabyte) if cover.byte_size > MAX_SIZE
    end
end
