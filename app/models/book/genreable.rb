module Book::Genreable
  extend ActiveSupport::Concern

  included do
    has_many :book_genres, dependent: :destroy
    has_many :genres, -> { order(:name) }, through: :book_genres

    scope :by_genre, ->(genre) { where(id: BookGenre.joins(:genre).where(genres: { name: genre }).select(:book_id)) if genre.present? }
  end

  def genre_names
    genres.map(&:name)
  end

  def genre_names=(names)
    self.genres = Array(names).map(&:squish).compact_blank.uniq(&:downcase).map { |name| Genre.find_or_initialize_by_name(name) }
  end
end
