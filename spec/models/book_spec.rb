require 'rails_helper'

RSpec.describe Book, type: :model do
  describe "validations" do
    it { should validate_presence_of(:title) }
    it { should validate_presence_of(:author_name) }
    it { should validate_presence_of(:genre) }
    it { should validate_numericality_of(:published_year).only_integer }
  end
end
