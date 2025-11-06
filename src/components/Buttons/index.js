
const commonstyle =
  "px-8 py-3.5 rounded-lg flex items-center justify-center text-xl disabled:opacity-50 focus-visible:outline-cyan-600";

export const PrimaryButton = (props) => {
  return (
    <button
      {...props}
      className={`${commonstyle} ${props.className} bg-system-green text-white border border-system-green `}
    />
  );
};

export const OutlineButton = (props) => {
  return (
    <button
      {...props}
      className={`${commonstyle} ${props.className} bg-white text-system-green border-system-green border`}
    />
  );
};
