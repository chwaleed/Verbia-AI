import { Eraser, Sparkles } from "lucide-react";
import React, { useState } from "react";
import axiosInstace from "../lib/axios.js";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";

const RemoveBackground = () => {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");

  const { getToken } = useAuth();

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    
    if (!input) {
      toast.error("Please select an image file first");
      return;
    }
    
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("image", input);
      
      const token = await getToken();
      const config = {
        headers: { 
          Authorization: `Bearer ${token}`
        },
        transformRequest: [function (data, headers) {
          delete headers['Content-Type'];
          return data;
        }]
      };
      
      const { data } = await axiosInstace.post(
        "/api/ai/remove-image-background",
        formData,
        config
      );

      if (data.success) {
        setContent(data.content);
      } else {
        toast.error(data.message || data.error || "An error occurred");
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="h-full overflow-y-scroll p-6  flex items-start flex-wrap gap-4 text-slate-700">
      {/* left col */}
      <form
        onSubmit={onSubmitHandler}
        action=""
        className="w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200"
      >
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 text-[#FF4938]" />
          <h1 className="text-xl font-semibold">Background Removal</h1>
        </div>
        <p className="mt-6 text-sm font-medium">Upload Image</p>
        <input
          onChange={(e) => setInput(e.target.files[0])}
          type="file"
          accept="image/*"
          className="w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300 text-gray-600 "
          required
        />
        <p className="text-xs text-gray-500 font-light mt-1">
          Supports JPG, PNG, and other Image formats
        </p>
        <button
          disabled={loading}
          className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#F6AB41] to-[#FF4938] text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              Removing background Image...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Eraser className="size-5" />
              Remove Background
            </span>
          )}
        </button>
      </form>

      {/* Right col */}

      <div className="w-full max-w-lg p-4 bg-white rounede-lg flex flex-col border border-gray-200 min-h-96">
        <div className="flex items-center gap-3">
          <Eraser className="size-5 text-[#FF4938]" />
          <h1 className="text-xl font-semibold">Processed Iamge</h1>
        </div>
        <div className="flex-1 flex justify-center items-center">
          {!content ? (
            <div className="text-sm flex flex-col items-center gap-5 text-gray-400">
              <Eraser className="size-9" />
              <p>
                Uplaod an Image and click "Remove Background" to get started
              </p>
            </div>
          ) : (
            <div>
              <img src={content} alt="image" className="mt-3 w-full h-full" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RemoveBackground;
