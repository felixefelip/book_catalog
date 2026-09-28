require 'rails_helper'

RSpec.describe User, type: :model do
  subject { build(:user) }

  describe "validations" do
    it { should validate_presence_of(:name) }
    it { should validate_presence_of(:last_name) }
    it { should validate_presence_of(:email_address) }
    it { should validate_uniqueness_of(:email_address).ignoring_case_sensitivity }
    it { should validate_length_of(:password).is_at_least(8) }
    it { should allow_value("leitor@example.com").for(:email_address) }
    it { should_not allow_value("leitor").for(:email_address) }
  end

  it "normalizes the email address" do
    expect(User.new(email_address: " Leitor@Example.COM ").email_address).to eq("leitor@example.com")
  end
end
