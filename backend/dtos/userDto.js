class UserDTO {
  static toResponse(user) {
    if (!user) return null;
    return {
      id: user._id ? user._id.toString() : user.id,
      name: user.name,
      email: user.email,
      profileImage: user.profileImage || '',
      preferredFocusDuration: user.preferredFocusDuration || 25,
      meditationPreferences: user.meditationPreferences || [],
      notificationPreferences: user.notificationPreferences || { email: true, sessionReminders: true },
      createdAt: user.createdAt
    };
  }
}

module.exports = UserDTO;

