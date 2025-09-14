import { Scissors, Sparkles } from "lucide-react";
import React, { useState } from "react";
import axiosInstance from "../lib/axios.js";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";

const RemoveObject = () => {
  const [imageFile, setImageFile] = useState(null);
  const [object, setObject] = useState("");
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");

  const { getToken } = useAuth();

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      if (!imageFile) return toast.error("Please select an image file");
      if (!object.trim()) return toast.error("Please enter object name to remove");
      if (object.split(" ").length > 1) return toast.error("Please enter only one object name");

      const formData = new FormData();
      formData.append("image", imageFile);
      formData.append("object", object);

      const { data } = await axiosInstance.post(
        "/api/ai/remove-image-object",
        formData,
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (data.success) {
        setContent(data.content);
        toast.success("Object removed successfully!");
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
    <div className="h-full overflow-y-scroll p-6 flex  flex-wrap items-start gap-6 text-slate-700">
      {/* Left col */}
      <form
        onSubmit={onSubmitHandler}
        className="flex-1 max-w-lg p-4 bg-white rounded-lg border border-gray-200"
      >
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 text-[#4A7AFF]" />
          <h1 className="text-xl font-semibold">Object Removal</h1>
        </div>

        <p className="mt-6 text-sm font-medium">Upload Image</p>
        <input
          onChange={(e) => setImageFile(e.target.files[0])}
          type="file"
          accept="image/*"
          className="w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300 text-gray-600"
          required
        />
        {imageFile && (
          <p className="mt-1 text-xs text-green-600">
            Selected: {imageFile.name}
          </p>
        )}

        <p className="mt-4 text-sm font-medium">Describe Object to remove</p>
        <textarea
          onChange={(e) => setObject(e.target.value)}
          value={object}
          rows={4}
          className="w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300"
          placeholder="e.g., Watch or spoon (only single object name)"
          required
        />

        <button
          disabled={loading}
          className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#417DF6] to-[#8E37EB] text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              Removing Object...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Scissors className="size-5" />
              Remove Object
            </span>
          )}
        </button>
      </form>

      {/* Right col */}
      <div className="flex-1 max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96">
        <div className="flex items-center gap-3">
          <Scissors className="size-5 text-[#4A7AFF]" />
          <h1 className="text-xl font-semibold">Processed Image</h1>
        </div>

        {!content ? (
          <div className="flex-1 flex justify-center items-center">
            <div className="text-sm flex flex-col items-center gap-5 text-gray-400">
              <Scissors className="size-9" />
              <p>Upload an image and click "Remove Object" to get started</p>
            </div>
          </div>
        ) : (
            <img
              src={content}
              alt="Processed"
              className="mt-3 h-full w-full"
            />
        )}
      </div>
    </div>
  );
};

export default RemoveObject;
