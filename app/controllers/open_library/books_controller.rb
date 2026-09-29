module OpenLibrary
  class BooksController < ApplicationController
    MIN_QUERY_LENGTH = 3

    rate_limit to: 30, within: 1.minute
    rescue_from OpenLibrary::Client::Error, with: :render_unavailable

    def index
      query = params[:q].to_s.strip
      return render json: [] if query.length < MIN_QUERY_LENGTH

      render json: client.search(query)
    end

    def show
      render json: { description: client.description(params[:id]) }
    end

    private
      def client
        OpenLibrary::Client.new
      end

      def render_unavailable
        render json: { error: t("open_library.unavailable") }, status: :bad_gateway
      end
  end
end
