class GenresController < ApplicationController
  PER_PAGE = 20

  allow_unauthenticated_access

  def index
    genres = Genre.in_use.name_contains(params[:q]).order(:name).page(params[:page]).per(PER_PAGE)

    render json: { genres: genres.pluck(:name), next_page: genres.next_page }
  end
end
