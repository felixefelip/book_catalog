require 'rails_helper'

RSpec.describe BookGenre, type: :model do
  describe "associations" do
    it { should belong_to(:book) }
    it { should belong_to(:genre) }
  end
end
