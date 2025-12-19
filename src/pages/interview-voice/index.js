export const createMessage = ({ updated_at = Date.now(), source = "bot" || "user", msg = "", received = false }) => ({
  updated_at,
  source,
  msg,
  received,
})
