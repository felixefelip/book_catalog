FactoryBot.define do
  factory :book do
    title { "Practical Object-Oriented Design: An Agile Primer Using Ruby" }
    author_name { "Sandi Metz" }
    genre { "Programming" }
    published_year { 2018 }
  end
end
