module OpenLibraryHelpers
  OPEN_LIBRARY_SEARCH_URL = "https://openlibrary.org/search.json".freeze

  def stub_open_library_search(docs:)
    stub_request(:get, OPEN_LIBRARY_SEARCH_URL)
      .with(query: hash_including({}))
      .to_return(status: 200, body: { docs: docs }.to_json, headers: { "Content-Type" => "application/json" })
  end

  def stub_open_library_search_failure(status: 503)
    stub_request(:get, OPEN_LIBRARY_SEARCH_URL).with(query: hash_including({})).to_return(status: status)
  end

  def stub_open_library_work(work_id:, body:)
    stub_request(:get, "https://openlibrary.org/works/#{work_id}.json")
      .to_return(status: 200, body: body.to_json, headers: { "Content-Type" => "application/json" })
  end

  def stub_open_library_cover(cover_id:, body: file_fixture("cover.png").binread, content_type: "image/png", status: 200)
    stub_request(:get, "https://covers.openlibrary.org/b/id/#{cover_id}-L.jpg")
      .with(query: { default: "false" })
      .to_return(status: status, body: body, headers: { "Content-Type" => content_type })
  end
end

RSpec.configure do |config|
  config.include OpenLibraryHelpers
end
