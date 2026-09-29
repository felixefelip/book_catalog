module OpenLibrary
  class Client
    include HTTParty

    class Error < StandardError; end

    SEARCH_FIELDS = %w[key title author_name first_publish_year subject cover_i].freeze
    SEARCH_LIMIT = 10
    COVERS_HOST = "https://covers.openlibrary.org".freeze
    WORK_ID_FORMAT = /\A[A-Za-z0-9]+\z/
    REQUEST_ERRORS = [ HTTParty::Error, Timeout::Error, SocketError, SystemCallError, OpenSSL::SSL::SSLError ].freeze

    base_uri "https://openlibrary.org"
    default_timeout 5
    headers "User-Agent" => "BookCatalog/1.0"

    def search(title)
      response = get_json("/search.json", query: { title: title, fields: SEARCH_FIELDS.join(","), limit: SEARCH_LIMIT })

      response.fetch("docs", []).map { |doc| serialize_doc(doc) }
    end

    def description(work_id)
      raise Error, "Invalid work id: #{work_id.inspect}" unless work_id.to_s.match?(WORK_ID_FORMAT)

      description = get_json("/works/#{work_id}.json")["description"]

      description.is_a?(Hash) ? description["value"] : description
    end

    def cover(cover_id)
      response = fetch("/b/id/#{cover_id}-L.jpg", base_uri: COVERS_HOST, query: { default: false })

      { io: StringIO.new(response.body), filename: "open-library-#{cover_id}.jpg", content_type: response.headers["content-type"] }
    end

    private
      def get_json(path, **options)
        JSON.parse(fetch(path, **options).body)
      rescue JSON::ParserError => error
        raise Error, error.message
      end

      def fetch(path, **options)
        response = self.class.get(path, **options)
        raise Error, "Open Library responded with status #{response.code}" unless response.success?

        response
      rescue *REQUEST_ERRORS => error
        raise Error, error.message
      end

      def serialize_doc(doc)
        {
          id: doc["key"].delete_prefix("/works/"),
          title: doc["title"],
          authors: Array(doc["author_name"]),
          published_year: doc["first_publish_year"],
          subjects: Array(doc["subject"]),
          cover_id: doc["cover_i"],
          cover_url: ("#{COVERS_HOST}/b/id/#{doc["cover_i"]}-M.jpg" if doc["cover_i"])
        }
      end
  end
end
