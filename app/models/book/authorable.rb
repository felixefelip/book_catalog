module Book::Authorable
  extend ActiveSupport::Concern

  included do
    has_many :book_authors, -> { order(:id) }, dependent: :destroy
    has_many :authors, through: :book_authors

    scope :by_authors, ->(names) { where(id: BookAuthor.joins(:author).where(authors: { name: names }).select(:book_id)) if names.present? }
  end

  def author_names
    authors.map(&:name)
  end

  def author_names=(names)
    self.authors = Array(names).map(&:squish).compact_blank.uniq(&:downcase).map { |name| Author.find_or_initialize_by_name(name) }
  end
end
