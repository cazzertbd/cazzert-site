import { MessageAlert } from "@/components/ui/MessageAlert";
import { useAstroAction } from "@/hooks/useAstroAction";
import { actions } from "astro:actions";
import React, { useEffect } from "react";
import {
  MdOutlineCategory,
  MdOutlineEmail,
  MdOutlineMessage,
  MdOutlinePerson,
  MdOutlineSubject,
} from "react-icons/md";

const ContactForm: React.FC = () => {
  const { state, formAction, isPending } = useAstroAction(
    actions.contact.submit,
  );

  // Reset form on successful submission
  useEffect(() => {
    if (state?.data?.success) {
      const form = document.querySelector("form") as HTMLFormElement;
      if (form) {
        const timeout = setTimeout(() => {
          form.reset();
        }, 2000); // Reset after 2 seconds

        return () => clearTimeout(timeout);
      }
    }
  }, [state]);

  return (
    <div className="w-full">
      <form onSubmit={formAction} className="space-y-5">
        {/* Message Alert */}
        <MessageAlert
          type={state?.data?.success ? "success" : "error"}
          message={state?.data?.message}
          show={!!state?.data?.message}
          className="mb-4"
        />

        {/* Name and Email */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label
              htmlFor="name"
              className="text-text-base mb-2 block text-sm font-medium"
            >
              Full Name *
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <MdOutlinePerson className="text-text-subtle h-5 w-5" />
              </div>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="border-border focus:border-primary focus:ring-primary/20 bg-bg-alt text-text-base w-full rounded-lg border px-4 py-3 pl-10 text-sm transition-colors focus:ring-2 focus:outline-none"
                placeholder="Enter your full name"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="email"
              className="text-text-base mb-2 block text-sm font-medium"
            >
              Email Address *
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <MdOutlineEmail className="text-text-subtle h-5 w-5" />
              </div>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="border-border focus:border-primary focus:ring-primary/20 bg-bg-alt text-text-base w-full rounded-lg border px-4 py-3 pl-10 text-sm transition-colors focus:ring-2 focus:outline-none"
                placeholder="Enter your email"
              />
            </div>
          </div>
        </div>

        {/* Inquiry Type */}
        <div>
          <label
            htmlFor="type"
            className="text-text-base mb-2 block text-sm font-medium"
          >
            Inquiry Type
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MdOutlineCategory className="text-text-subtle h-5 w-5" />
            </div>
            <select
              id="type"
              name="type"
              className="border-border focus:border-primary focus:ring-primary/20 bg-bg-alt text-text-base w-full rounded-lg border px-4 py-3 pl-10 text-sm transition-colors focus:ring-2 focus:outline-none"
            >
              <option value="general">General Inquiry</option>
              <option value="custom-order">Custom Cake Order</option>
              <option value="wedding">Wedding Cakes</option>
              <option value="bulk-order">Bulk Orders</option>
              <option value="complaint">Complaint/Feedback</option>
            </select>
          </div>
        </div>

        {/* Subject */}
        <div>
          <label
            htmlFor="subject"
            className="text-text-base mb-2 block text-sm font-medium"
          >
            Subject *
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MdOutlineSubject className="text-text-subtle h-5 w-5" />
            </div>
            <input
              type="text"
              id="subject"
              name="subject"
              required
              className="border-border focus:border-primary focus:ring-primary/20 bg-bg-alt text-text-base w-full rounded-lg border px-4 py-3 pl-10 text-sm transition-colors focus:ring-2 focus:outline-none"
              placeholder="Brief subject of your message"
            />
          </div>
        </div>

        {/* Message */}
        <div>
          <label
            htmlFor="message"
            className="text-text-base mb-2 block text-sm font-medium"
          >
            Message *
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute top-3 left-0 flex items-start pl-3">
              <MdOutlineMessage className="text-text-subtle h-5 w-5" />
            </div>
            <textarea
              id="message"
              name="message"
              required
              rows={5}
              className="border-border focus:border-primary focus:ring-primary/20 bg-bg-alt text-text-base w-full resize-none rounded-lg border px-4 py-3 pl-10 text-sm transition-colors focus:ring-2 focus:outline-none"
              placeholder="Tell us about your cake needs, special requirements, or any questions..."
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="bg-primary hover:bg-primary-dark disabled:bg-primary-light focus:ring-primary/30 text-text-light w-full rounded-lg px-6 py-3 text-sm font-medium transition-colors focus:ring-2 focus:outline-none disabled:cursor-not-allowed"
          >
            {isPending ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Sending...
              </span>
            ) : (
              "Send Message"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContactForm;
