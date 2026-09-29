require "rails_helper"

RSpec.describe OpenLibrary::Client do
  subject(:client) { described_class.new }

  def stub_response(body, success: true, code: 200, headers: {})
    body = body.to_json unless body.is_a?(String)
    response = instance_double(HTTParty::Response, success?: success, code: code, body: body, headers: headers)
    allow(described_class).to receive(:get).and_return(response)
  end

  describe "#search" do
    it "searches by title and serializes the results" do
      stub_response({
        docs: [
          {
            key: "/works/OL1003040W",
            title: "Dom Casmurro",
            author_name: [ "Machado de Assis", "Helen Caldwell" ],
            first_publish_year: 1899,
            subject: %w[Fiction Adultery Jealousy Brazil Memory Religion],
            cover_i: 647501
          }
        ]
      })

      results = client.search("dom casmurro")

      expect(described_class).to have_received(:get)
        .with("/search.json", query: hash_including(title: "dom casmurro", limit: 5))
      expect(results).to eq([
        {
          id: "OL1003040W",
          title: "Dom Casmurro",
          author_name: "Machado de Assis, Helen Caldwell",
          published_year: 1899,
          subjects: %w[Fiction Adultery Jealousy Brazil Memory],
          cover_id: 647501,
          cover_url: "https://covers.openlibrary.org/b/id/647501-M.jpg"
        }
      ])
    end

    it "handles results without optional fields" do
      stub_response({ docs: [ { key: "/works/OL1W", title: "Untitled" } ] })

      expect(client.search("untitled").first)
        .to include(author_name: "", published_year: nil, subjects: [], cover_id: nil, cover_url: nil)
    end

    it "raises an error when the API responds with a failure" do
      stub_response({}, success: false, code: 503)

      expect { client.search("dom casmurro") }.to raise_error(OpenLibrary::Client::Error)
    end

    it "raises an error when the request fails" do
      allow(described_class).to receive(:get).and_raise(Net::OpenTimeout)

      expect { client.search("dom casmurro") }.to raise_error(OpenLibrary::Client::Error)
    end
  end

  describe "#description" do
    it "returns a plain text description" do
      stub_response({ description: "Bentinho e Capitu." })

      expect(client.description("OL1003040W")).to eq("Bentinho e Capitu.")
      expect(described_class).to have_received(:get).with("/works/OL1003040W.json")
    end

    it "returns the value of a typed description" do
      stub_response({ description: { type: "/type/text", value: "Bentinho e Capitu." } })

      expect(client.description("OL1003040W")).to eq("Bentinho e Capitu.")
    end

    it "rejects work ids that could change the requested path" do
      allow(described_class).to receive(:get)

      [ "../authors/OL93286A", "..%2Fauthors", "OL1W?x=1", "", nil ].each do |work_id|
        expect { client.description(work_id) }.to raise_error(OpenLibrary::Client::Error)
      end
      expect(described_class).not_to have_received(:get)
    end

    it "returns nil when the work has no description" do
      stub_response({ title: "Dom Casmurro" })

      expect(client.description("OL1003040W")).to be_nil
    end
  end

  describe "#cover" do
    it "downloads the large cover image" do
      image = file_fixture("cover.png").binread
      stub_response(image, headers: { "content-type" => "image/png" })

      cover = client.cover(647501)

      expect(described_class).to have_received(:get)
        .with("/b/id/647501-L.jpg", base_uri: "https://covers.openlibrary.org", query: { default: false })
      expect(cover).to include(filename: "open-library-647501.jpg", content_type: "image/png")
      expect(cover[:io].read).to eq(image)
    end

    it "raises an error when the cover does not exist" do
      stub_response("", success: false, code: 404)

      expect { client.cover(647501) }.to raise_error(OpenLibrary::Client::Error)
    end
  end
end
