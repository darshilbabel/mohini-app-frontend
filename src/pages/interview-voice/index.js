export const createMessage = ({
  updated_at = Date.now(),
  source = "bot" || "user",
  msg = "",
}) => ({
  updated_at,
  source,
  msg,
});

