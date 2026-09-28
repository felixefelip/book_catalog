FactoryBot.define do
  factory :user do
    name { "Machado" }
    last_name { "de Assis" }
    sequence(:email_address) { |n| "user#{n}@example.com" }
    password { "password" }
  end
end
