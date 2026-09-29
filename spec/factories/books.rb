FactoryBot.define do
  factory :book do
    association :creator, factory: :user
    title { "Practical Object-Oriented Design: An Agile Primer Using Ruby" }
    author_name { "Sandi Metz" }
    genre_names { [ "Programming" ] }
    published_year { 2018 }
  end
end
