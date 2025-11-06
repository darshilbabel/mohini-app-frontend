import { BiLoader } from "react-icons/bi";

export default function SaticModal({ message, heading = "Please wait" }) {
  return (
    <div className="fixed top-0 w-screen h-screen flex items-center justify-center bg-[#24242425] ">
      <div className="bg-white rounded-lg w-full max-w-[500px]">
        <div className="border-b rounded-lg border-gray-200 p-4 text-2xl text-system-green bg-system-green-light-extra text-center">
          {heading}
        </div>
        <div className="p-4">
          <div className="text-center flex items-center justify-center my-6">
            <BiLoader className="animate-spin text-4xl text-system-green" />
          </div>
          <div className="text-xl text-center text-gray-500 my-6">
            {message}
          </div>
        </div>
      </div>
    </div>
  );
}
