require "webmock/rspec"

web_mock_allowed_hosts = if ENV["SELENIUM_HOST"]
  [ ENV["SELENIUM_HOST"], "rails-app" ]
end

WebMock.disable_net_connect!(allow_localhost: true, allow: web_mock_allowed_hosts)
