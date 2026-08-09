/* Mongoose models for Esto */
import mongoose from "mongoose";
const { Schema, model } = mongoose;

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String },          // absent for OAuth-only accounts
  role: { type: String, enum: ["user", "agent", "admin"], default: "user" },
  title: String,                            // agent role/area
  phone: String,
  photo: String,
  createdAt: { type: Date, default: Date.now }
});
userSchema.methods.public = function () {
  return { id: this._id, name: this.name, email: this.email, role: this.role, title: this.title, phone: this.phone, photo: this.photo };
};

const messageSchema = new Schema({
  threadId: { type: String, index: true },  // sorted "idA:idB"
  from: { type: Schema.Types.ObjectId, ref: "User", index: true },
  to: { type: Schema.Types.ObjectId, ref: "User", index: true },
  text: { type: String, required: true },
  at: { type: Date, default: Date.now },
  read: { type: Boolean, default: false }
});

const notificationSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", index: true },
  ico: { type: String, default: "bell" },
  title: String,
  body: String,
  at: { type: Date, default: Date.now },
  read: { type: Boolean, default: false }
});

const savedSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", index: true },
  propertyId: { type: String, required: true },
  at: { type: Date, default: Date.now }
});
savedSchema.index({ user: 1, propertyId: 1 }, { unique: true });

const viewingSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", index: true },
  propertyId: String,
  title: String,
  area: String,
  when: String,
  agent: String,
  status: { type: String, enum: ["pending", "confirmed", "cancelled"], default: "pending" },
  paid: { type: Boolean, default: false },
  at: { type: Date, default: Date.now }
});

const paymentSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", index: true },
  type: String, amount: Number, ref: String,
  phone: String, checkoutRequestId: String,
  status: { type: String, default: "pending" },
  at: { type: Date, default: Date.now }
});

export const User = model("User", userSchema);
export const Message = model("Message", messageSchema);
export const Notification = model("Notification", notificationSchema);
export const Saved = model("Saved", savedSchema);
export const Viewing = model("Viewing", viewingSchema);
export const Payment = model("Payment", paymentSchema);

export const threadId = (a, b) => [String(a), String(b)].sort().join(":");
