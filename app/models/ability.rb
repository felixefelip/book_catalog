class Ability
  include CanCan::Ability

  def initialize(user)
    can :read, Book
    return unless user

    can :create, Book
    can %i[update destroy], Book, creator_id: user.id
  end
end
