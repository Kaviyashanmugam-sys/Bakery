const Session = require("../models/Session");

// Fetches the session for a phone number, creating a fresh one (IDLE) if none exists
async function getSession(phone) {
  let session = await Session.findOne({ phone });
  if (!session) {
    session = await Session.create({ phone, step: "IDLE", data: {} });
  }
  return session;
}

// Merges partial updates into session.data and optionally moves to a new step
async function updateSession(phone, { step, dataPatch = {} } = {}) {
  const session = await getSession(phone);
  if (step) session.step = step;
  session.data = { ...session.data.toObject?.() ?? session.data, ...dataPatch };
  session.lastInteractionAt = new Date();
  session.markModified("data");
  await session.save();
  return session;
}

// Resets a session back to IDLE and wipes collected data (used after order completion / cancellation)
async function resetSession(phone) {
  const session = await getSession(phone);
  session.step = "IDLE";
  session.data = {};
  session.markModified("data");
  await session.save();
  return session;
}

module.exports = { getSession, updateSession, resetSession };
