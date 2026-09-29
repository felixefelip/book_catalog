class User < ApplicationRecord
  has_secure_password
  has_many :sessions, dependent: :destroy
  has_many :books, foreign_key: :creator_id, inverse_of: :creator, dependent: :destroy

  normalizes :email_address, with: ->(e) { e.strip.downcase }

  validates :name, :last_name, presence: true
  validates :email_address, presence: true, uniqueness: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :password, length: { minimum: 8 }, allow_nil: true

  def full_name
    "#{name} #{last_name}"
  end
end
