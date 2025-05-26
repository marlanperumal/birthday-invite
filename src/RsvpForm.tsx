import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Doc } from "../convex/_generated/dataModel";
import { Check, ChevronsUpDown, PlusCircle, Trash2, UserPlus, X } from "lucide-react";
import { cn } from "./lib/utils";


const dietaryOptions = [
  { id: "meat", label: "Meat" },
  { id: "dairy", label: "Dairy" },
  { id: "seafood", label: "Seafood" },
  { id: "greenStuff", label: "Green Stuff" },
  { id: "gluten", label: "Gluten" },
] as const;

type DietaryOption = typeof dietaryOptions[number]["id"];

const rsvpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  dietaryPreferences: z.array(z.string()),
  otherDietaryPreference: z.string().optional(),
  hasPlusOne: z.boolean(),
  plusOneName: z.string().optional(),
  plusOneEmail: z.string().email("Invalid email address").optional().or(z.literal('')),
  plusOneDietaryPreferences: z.array(z.string()).optional(),
  plusOneOtherDietaryPreference: z.string().optional(),
}).refine(data => {
  if (data.hasPlusOne) {
    return !!data.plusOneName && data.plusOneName.length >= 2 && !!data.plusOneEmail;
  }
  return true;
}, {
  message: "Plus one name (min 2 chars) and email are required if bringing a guest.",
  path: ["plusOneName"], // Show error near plus one name field
});


type RsvpFormData = z.infer<typeof rsvpSchema>;

interface RsvpFormProps {
  userEmail: string;
  currentRsvp: Doc<"rsvps"> | null | undefined;
}

export default function RsvpForm({ userEmail, currentRsvp }: RsvpFormProps) {
  const submitRsvp = useMutation(api.rsvps.submitRsvp);
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [showPlusOneOtherInput, setShowPlusOneOtherInput] = useState(false);

  const { register, handleSubmit, control, watch, setValue, formState: { errors, isSubmitting } } = useForm<RsvpFormData>({
    resolver: zodResolver(rsvpSchema),
    defaultValues: {
      name: "",
      email: userEmail,
      dietaryPreferences: [],
      otherDietaryPreference: "",
      hasPlusOne: false,
      plusOneName: "",
      plusOneEmail: "",
      plusOneDietaryPreferences: [],
      plusOneOtherDietaryPreference: "",
    }
  });

  useEffect(() => {
    if (currentRsvp) {
      setValue("name", currentRsvp.name);
      setValue("email", currentRsvp.email);
      setValue("dietaryPreferences", currentRsvp.dietaryPreferences);
      if (currentRsvp.dietaryPreferences.includes("other")) {
        setShowOtherInput(true);
        setValue("otherDietaryPreference", currentRsvp.otherDietaryPreference || "");
      } else {
        setShowOtherInput(false);
        setValue("otherDietaryPreference", "");
      }
      setValue("hasPlusOne", currentRsvp.hasPlusOne);
      setValue("plusOneName", currentRsvp.plusOneName || "");
      setValue("plusOneEmail", currentRsvp.plusOneEmail || "");
      setValue("plusOneDietaryPreferences", currentRsvp.plusOneDietaryPreferences || []);
      if (currentRsvp.plusOneDietaryPreferences?.includes("other")) {
        setShowPlusOneOtherInput(true);
        setValue("plusOneOtherDietaryPreference", currentRsvp.plusOneOtherDietaryPreference || "");
      } else {
        setShowPlusOneOtherInput(false);
        setValue("plusOneOtherDietaryPreference", "");
      }
    } else {
      // Reset to default if no currentRsvp (e.g., after clearing form or initial load)
      setValue("name", "");
      setValue("email", userEmail); // Keep userEmail
      setValue("dietaryPreferences", []);
      setShowOtherInput(false);
      setValue("otherDietaryPreference", "");
      setValue("hasPlusOne", false);
      setValue("plusOneName", "");
      setValue("plusOneEmail", "");
      setValue("plusOneDietaryPreferences", []);
      setShowPlusOneOtherInput(false);
      setValue("plusOneOtherDietaryPreference", "");
    }
  }, [currentRsvp, setValue, userEmail]);


  const hasPlusOne = watch("hasPlusOne");
  const mainGuestDietaryPrefs = watch("dietaryPreferences");
  const plusOneDietaryPrefs = watch("plusOneDietaryPreferences");

  useEffect(() => {
    if (mainGuestDietaryPrefs?.includes("other")) {
      setShowOtherInput(true);
    } else {
      setShowOtherInput(false);
      setValue("otherDietaryPreference", "");
    }
  }, [mainGuestDietaryPrefs, setValue]);

  useEffect(() => {
    if (plusOneDietaryPrefs?.includes("other")) {
      setShowPlusOneOtherInput(true);
    } else {
      setShowPlusOneOtherInput(false);
      setValue("plusOneOtherDietaryPreference", "");
    }
  }, [plusOneDietaryPrefs, setValue]);


  const onSubmit = async (data: RsvpFormData) => {
    try {
      // Ensure optional fields for plus one are undefined if not bringing a guest
      const payload = {
        ...data,
        plusOneName: data.hasPlusOne ? data.plusOneName : undefined,
        plusOneEmail: data.hasPlusOne ? data.plusOneEmail : undefined,
        plusOneDietaryPreferences: data.hasPlusOne ? data.plusOneDietaryPreferences : undefined,
        plusOneOtherDietaryPreference: data.hasPlusOne && data.plusOneDietaryPreferences?.includes("other") ? data.plusOneOtherDietaryPreference : undefined,
        otherDietaryPreference: data.dietaryPreferences.includes("other") ? data.otherDietaryPreference : undefined,
      };
      await submitRsvp(payload);
      toast.success(currentRsvp ? "RSVP updated successfully!" : "RSVP submitted successfully! We can't wait to celebrate with you!");
    } catch (error) {
      console.error("RSVP submission error:", error);
      toast.error("Failed to submit RSVP. Please try again.");
    }
  };

  const toggleDietaryPreference = (field: "dietaryPreferences" | "plusOneDietaryPreferences", preference: DietaryOption | "other") => {
    const currentPrefs = watch(field) || [];
    const newPrefs = currentPrefs.includes(preference)
      ? currentPrefs.filter(p => p !== preference)
      : [...currentPrefs, preference];
    setValue(field, newPrefs, { shouldValidate: true });
  };


  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 mt-8">
      <div>
        <h3 className="text-2xl font-semibold text-gray-700 mb-4 border-b pb-2">Your Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
            <input id="name" {...register("name")} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm" />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
            <input id="email" type="email" {...register("email")} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm" />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
          </div>
        </div>
        <DietaryPreferencesSection
          title="What can't you eat?"
          preferences={mainGuestDietaryPrefs || []}
          onToggle={(pref) => toggleDietaryPreference("dietaryPreferences", pref)}
          showOtherInput={showOtherInput}
          otherInputProps={register("otherDietaryPreference")}
          error={errors.dietaryPreferences?.message || errors.otherDietaryPreference?.message}
        />
      </div>

      <div>
        <label htmlFor="hasPlusOne" className="flex items-center space-x-2 cursor-pointer">
          <Controller
            name="hasPlusOne"
            control={control}
            render={({ field }) => (
              <button
                type="button"
                role="switch"
                aria-checked={field.value}
                onClick={() => field.onChange(!field.value)}
                className={cn(
                  "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2",
                  field.value ? "bg-pink-500" : "bg-gray-300"
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                    field.value ? "translate-x-5" : "translate-x-0"
                  )}
                />
              </button>
            )}
          />
          <span className="text-sm font-medium text-gray-700">Bringing a guest?</span>
           {hasPlusOne ? <UserPlus className="w-5 h-5 text-pink-500" /> : <UserPlus className="w-5 h-5 text-gray-400" />}
        </label>
      </div>


      {hasPlusOne && (
        <div className="p-4 border border-pink-200 rounded-lg bg-pink-50/50 space-y-4">
          <h3 className="text-xl font-semibold text-pink-600 mb-3">Guest's Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="plusOneName" className="block text-sm font-medium text-gray-700">Guest's Full Name</label>
              <input id="plusOneName" {...register("plusOneName")} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm" />
              {errors.plusOneName && <p className="mt-1 text-xs text-red-500">{errors.plusOneName.message}</p>}
            </div>
            <div>
              <label htmlFor="plusOneEmail" className="block text-sm font-medium text-gray-700">Guest's Email Address</label>
              <input id="plusOneEmail" type="email" {...register("plusOneEmail")} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm" />
              {errors.plusOneEmail && <p className="mt-1 text-xs text-red-500">{errors.plusOneEmail.message}</p>}
            </div>
          </div>
          <DietaryPreferencesSection
            title="What can't your guest eat?"
            preferences={plusOneDietaryPrefs || []}
            onToggle={(pref) => toggleDietaryPreference("plusOneDietaryPreferences", pref)}
            showOtherInput={showPlusOneOtherInput}
            otherInputProps={register("plusOneOtherDietaryPreference")}
            error={errors.plusOneDietaryPreferences?.message || errors.plusOneOtherDietaryPreference?.message}
          />
        </div>
      )}
      {errors.root?.hasPlusOne && <p className="mt-1 text-xs text-red-500">{errors.root.hasPlusOne.message}</p>}


      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
        ) : (
          <Check className="w-5 h-5 mr-2" />
        )}
        {currentRsvp ? "Update RSVP" : "Submit RSVP"}
      </button>
    </form>
  );
}

interface DietaryPreferencesSectionProps {
  title: string;
  preferences: string[];
  onToggle: (preference: DietaryOption | "other") => void;
  showOtherInput: boolean;
  otherInputProps: any; // from react-hook-form register
  error?: string;
}

function DietaryChip({ label, selected, onClick }: { label: string, selected: boolean, onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 text-sm rounded-full border transition-colors duration-150",
        selected
          ? "bg-pink-500 text-white border-pink-500"
          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100 hover:border-gray-400"
      )}
    >
      {label}
    </button>
  );
}

function DietaryPreferencesSection({ title, preferences, onToggle, showOtherInput, otherInputProps, error }: DietaryPreferencesSectionProps) {
  return (
    <div className="mt-4">
      <p className="block text-sm font-medium text-gray-700 mb-2">{title}</p>
      <div className="flex flex-wrap gap-2">
        {dietaryOptions.map(opt => (
          <DietaryChip
            key={opt.id}
            label={opt.label}
            selected={preferences.includes(opt.id)}
            onClick={() => onToggle(opt.id)}
          />
        ))}
        <DietaryChip
          label="Other"
          selected={preferences.includes("other")}
          onClick={() => onToggle("other")}
        />
      </div>
      {showOtherInput && (
        <div className="mt-3">
          <label htmlFor={otherInputProps.name} className="block text-xs font-medium text-gray-600">Please specify "Other":</label>
          <input
            id={otherInputProps.name}
            {...otherInputProps}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
            placeholder="e.g., Nuts, Soy"
          />
        </div>
      )}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
