# frozen_string_literal: true

class InertiaController < ApplicationController
  inertia_share locale: -> { I18n.locale }
  inertia_share current_user: -> { Current.user&.as_json(only: %i[id email_address]) if authenticated? }
end
