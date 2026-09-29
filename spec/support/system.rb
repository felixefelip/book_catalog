RSpec.configure do |config|
  config.before(type: :system) do
    driven_by :selenium, using: :headless_chrome, screen_size: [ 1400, 1000 ] do |options|
      options.add_preference("profile.password_manager_leak_detection", false)
    end
  end
end

Capybara.server_host = "localhost"
