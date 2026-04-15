const mongoose = require("mongoose");

const passengerSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  age:      { type: Number, required: true },
  gender:   { type: String, enum: ["Male", "Female", "Other"], required: true },
  berth:    { type: String, default: "No preference" },
  seat:     { type: String, default: "No preference" },
  meal:     { type: String, default: "No preference" },
  idType:   { type: String, default: "Aadhaar" },
  idNumber: { type: String, required: true },
});

const bookingSchema = new mongoose.Schema(
  {
    pnr: {
      type: String,
      unique: true,
      required: true,
    },

    /* ── Who booked ── */
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    /* ── Type: train or flight ── */
    type: {
      type: String,
      enum: ["train", "flight", "bus"],
      default: "train",
    },

    /* ── Train fields ── */
    trainNo:   { type: String, default: null },
    trainName: { type: String, default: null },
    classType: { type: String, default: null },

    /* ── Flight fields ── */
    flightNo:  { type: String, default: null },
    airline:   { type: String, default: null },
    cabin:     { type: String, default: null },
    stops:     { type: String, default: null },
    gate:      { type: String, default: null },

    /* ── Shared fields ── */
    from:        { type: String, required: true },
    to:          { type: String, required: true },
    date:        { type: String, required: true },
    departTime:  { type: String, default: null },
    arrivalTime: { type: String, default: null },
    duration:    { type: String, default: null },

    passengers: [passengerSchema],

    contact: {
      email: String,
      phone: String,
    },

    /* ── Status ── */
    status: {
      type: String,
      enum: ["CONFIRMED", "WAITING", "CANCELLED"],
      default: "CONFIRMED",
    },

    waitingNumber: { type: Number, default: null },
    seatInfo:      { type: String, default: null },

    /* ── Fare ── */
    fare:   { type: Number, required: true },
    refund: { type: Number, default: null },
  },
  { timestamps: true }
);

/* Index for fast user lookups */
bookingSchema.index({ userId: 1, createdAt: -1 });
bookingSchema.index({ pnr: 1 });

module.exports = mongoose.model("Booking", bookingSchema);