import { Construction } from "lucide-react";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import customFetch from "@/utils/fetch";

const ComingSoon = () => {
  const [email, setEmail] = useState("");

  const mutation = useMutation({
    mutationFn: (email: string) => customFetch.post("/newsletter", { email }),
    onSuccess: () => {
      toast.success("You've been added to our notification list.");
      setEmail("");
    },
    onError: (error) => {
      console.log(error);
      toast.error("Failed to subscribe. You have already subscribed.");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    mutation.mutate(email);
  };

  return (
    <div className="flex lg:col-span-2 flex-col items-center justify-center p-8 bg-white rounded-lg border border-neutral-200/20 min-h-full w-full">
      <div className="h-20 w-20 bg-purple-100 rounded-full flex items-center justify-center mb-6">
        <Construction className="h-10 w-10 text-purple-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-3">Coming Soon</h2>
      <p className="text-gray-500 text-center max-w-md mb-8">
        We're working hard to bring you something amazing. Stay tuned for
        exciting new features and improvements.
      </p>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center gap-4"
      >
        <p className="text-sm text-gray-400">
          Want to be notified when we launch?
        </p>
        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="email"
            required={true}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={mutation.isPending}
          />
          <button
            type="submit"
            disabled={mutation.isPending}
            className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {mutation.isPending ? "Subscribing..." : "Notify Me"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ComingSoon;
