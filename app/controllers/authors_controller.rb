class AuthorsController < ApplicationController
  PER_PAGE = 20

  allow_unauthenticated_access

  def index
    authors = Author.in_use.name_contains(params[:q]).order(:name).page(params[:page]).per(PER_PAGE)

    render json: { names: authors.pluck(:name), next_page: authors.next_page }
  end
end
