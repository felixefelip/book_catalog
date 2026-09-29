require 'rails_helper'
require 'cancan/matchers'

RSpec.describe Ability, type: :model do
  let(:user) { create(:user) }
  let(:own_book) { create(:book, creator: user) }
  let(:other_book) { create(:book) }

  context "when signed in" do
    subject(:ability) { described_class.new(user) }

    it { should be_able_to(:read, other_book) }
    it { should be_able_to(:create, Book) }
    it { should be_able_to(:update, own_book) }
    it { should be_able_to(:destroy, own_book) }
    it { should_not be_able_to(:update, other_book) }
    it { should_not be_able_to(:destroy, other_book) }
  end

  context "when signed out" do
    subject(:ability) { described_class.new(nil) }

    it { should be_able_to(:read, other_book) }
    it { should_not be_able_to(:create, Book) }
    it { should_not be_able_to(:update, other_book) }
    it { should_not be_able_to(:destroy, other_book) }
  end
end
