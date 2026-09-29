class ApplicationController < ActionController::Base
  include Authentication
  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  allow_browser versions: :modern

  rescue_from CanCan::AccessDenied do
    redirect_to books_path, alert: t("authorization.denied")
  end

  private
    def current_ability
      @current_ability ||= Ability.new(Current.user)
    end
end
