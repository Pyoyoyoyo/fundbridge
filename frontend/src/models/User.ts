import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  kycOtpVerified: { type: Boolean, default: false },
  kycVerified: { type: Boolean, default: false },
});

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
