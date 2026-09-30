module SystemDriverHelpers
  def drive_with_chrome_in_local
    served_by host: "localhost", port: nil

    driven_by :selenium, using: :headless_chrome, screen_size: [ 1400, 1000 ] do |options|
      options.add_preference("profile.password_manager_leak_detection", false)
    end
  end

  def drive_with_chrome_in_chrome
    served_by host: "rails-app", port: ENV.fetch("CAPYBARA_SERVER_PORT")

    driven_by :selenium, using: :headless_chrome, screen_size: [ 1400, 1000 ], options: {
      browser: :remote,
      url: "http://#{ENV.fetch("SELENIUM_HOST")}:4444"
    } do |options|
      options.add_preference("profile.password_manager_leak_detection", false)
      options.add_argument("--unsafely-treat-insecure-origin-as-secure=http://rails-app:#{ENV.fetch("CAPYBARA_SERVER_PORT")}")
    end
  end
end

RSpec.configure do |config|
  config.include SystemDriverHelpers, type: :system

  config.before(type: :system) do
    ENV["SELENIUM_HOST"] ? drive_with_chrome_in_chrome : drive_with_chrome_in_local
  end
end
