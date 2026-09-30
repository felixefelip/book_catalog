require "rails_helper"

RSpec.describe OpenLibrary::Client do
  subject(:client) { described_class.new }

  describe "#search" do
    it "searches by title and serializes the results" do
      stub_open_library_search(docs: [
        {
          key: "/works/OL1003040W",
          title: "Dom Casmurro",
          author_name: [ "Machado de Assis", "Helen Caldwell" ],
          first_publish_year: 1899,
          subject: %w[Fiction Adultery Jealousy Brazil Memory Religion],
          cover_i: 647501
        }
      ])

      results = client.search("dom casmurro")

      expect(WebMock).to have_requested(:get, OpenLibraryHelpers::OPEN_LIBRARY_SEARCH_URL).once
        .with(
          query: { title: "dom casmurro", fields: described_class::SEARCH_FIELDS.join(","), limit: "10" },
          headers: { "User-Agent" => "BookCatalog/1.0" }
        )

      expect(results).to eq([
        {
          id: "OL1003040W",
          title: "Dom Casmurro",
          authors: [ "Machado de Assis", "Helen Caldwell" ],
          published_year: 1899,
          subjects: %w[Fiction Adultery Jealousy Brazil Memory Religion],
          cover_id: 647501,
          cover_url: "https://covers.openlibrary.org/b/id/647501-M.jpg"
        }
      ])
    end

    it "handles results without optional fields" do
      stub_open_library_search(docs: [ { key: "/works/OL1W", title: "Untitled" } ])

      expect(client.search("untitled").first)
        .to include(authors: [], published_year: nil, subjects: [], cover_id: nil, cover_url: nil)
    end

    it "raises an error when the API responds with a failure" do
      stub_open_library_search_failure(status: 503)

      expect { client.search("dom casmurro") }.to raise_error(OpenLibrary::Client::Error)
    end

    it "raises an error when the request times out" do
      stub_request(:get, OpenLibraryHelpers::OPEN_LIBRARY_SEARCH_URL).with(query: hash_including({})).to_timeout

      expect { client.search("dom casmurro") }.to raise_error(OpenLibrary::Client::Error)
    end

    it "raises an error when the host cannot be reached" do
      stub_request(:get, OpenLibraryHelpers::OPEN_LIBRARY_SEARCH_URL).with(query: hash_including({})).to_raise(SocketError)

      expect { client.search("dom casmurro") }.to raise_error(OpenLibrary::Client::Error)
    end

    it "raises an error when the response is not valid JSON" do
      stub_request(:get, OpenLibraryHelpers::OPEN_LIBRARY_SEARCH_URL).with(query: hash_including({})).to_return(status: 200, body: "<html>")

      expect { client.search("dom casmurro") }.to raise_error(OpenLibrary::Client::Error)
    end
  end

  describe "#description" do
    it "returns a plain text description" do
      stub_open_library_work(work_id: "OL1003040W", body: { description: "Bentinho e Capitu." })

      expect(client.description("OL1003040W")).to eq("Bentinho e Capitu.")
    end

    it "returns the value of a typed description" do
      stub_open_library_work(work_id: "OL1003040W", body: { description: { type: "/type/text", value: "Bentinho e Capitu." } })

      expect(client.description("OL1003040W")).to eq("Bentinho e Capitu.")
    end

    it "rejects work ids that could change the requested path" do
      [ "../authors/OL93286A", "..%2Fauthors", "OL1W?x=1", "", nil ].each do |work_id|
        expect { client.description(work_id) }.to raise_error(OpenLibrary::Client::Error)
      end
      expect(WebMock).not_to have_requested(:any, /openlibrary\.org/)
    end

    it "returns nil when the work has no description" do
      stub_open_library_work(work_id: "OL1003040W", body: { title: "Dom Casmurro" })

      expect(client.description("OL1003040W")).to be_nil
    end
  end

  describe "#cover" do
    it "downloads the large cover image" do
      image = file_fixture("cover.png").binread
      stub_open_library_cover(cover_id: 647501, body: image)

      cover = client.cover(647501)

      expect(cover).to include(filename: "open-library-647501.jpg", content_type: "image/png")
      expect(cover[:io].read.b).to eq(image)
    end

    it "raises an error when the cover does not exist" do
      stub_open_library_cover(cover_id: 647501, body: "", status: 404)

      expect { client.cover(647501) }.to raise_error(OpenLibrary::Client::Error)
    end
  end
end
