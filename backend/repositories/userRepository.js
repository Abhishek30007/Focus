const User = require('../models/User');

class UserRepository {
  async findByEmail(email, includePassword = false) {
    const query = User.findOne({ email });
    if (includePassword) {
      query.select('+password');
    }
    return query.exec();
  }

  async findById(id) {
    return User.findById(id).select('-password').lean().exec();
  }

  async create(userData) {
    return User.create(userData);
  }

  async updateById(id, updateData) {
    return User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      .select('-password')
      .lean()
      .exec();
  }
}

module.exports = new UserRepository();

