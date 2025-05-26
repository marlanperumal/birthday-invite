import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Doc } from "../convex/_generated/dataModel";
import { Check, UserPlus } from "lucide-react";
import { cn } from "./lib/utils";

const GOLD = "#c9b037";
const OFFWHITE = "#f8f6f2";

const dietaryOptions = [
  { id: "meat", label: "Meat" },
  { id: "dairy", label: "Dairy" },
  { id: "seafood", label: "Seafood" },
  { id: "greenStuff", label: "Green Stuff" },
  { id: "gluten", label: "Gluten" },
] as const;

type DietaryOption = (typeof dietaryOptions)[number]["id"];

const rsvpSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    dietaryPreferences: z.array(z.string()),
    otherDietaryPreference: z.string().optional(),
    hasPlusOne: z.boolean(),
    plusOneName: z.string().optional(),
    plusOneEmail: z
      .string()
      .email("Invalid email address")
      .optional()
      .or(z.literal("")),
    plusOneDietaryPreferences: z.array(z.string()).optional(),
    plusOneOtherDietaryPreference: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.hasPlusOne) {
        return (
          !!data.plusOneName &&
          data.plusOneName.length >= 2 &&
          !!data.plusOneEmail
        );
      }
      return true;
    },
    {
      message:
        "Plus one name (min 2 chars) and email are required if bringing a guest.",
      path: ["plusOneName"],
    }
  );

type RsvpFormData = z.infer<typeof rsvpSchema>;

interface RsvpFormProps {
  userEmail: string;
  currentRsvp: Doc<"rsvps"> | null | undefined;
}

export default function RsvpForm({ userEmail, currentRsvp }: RsvpFormProps) {
  const submitRsvp = useMutation(api.rsvps.submitRsvp);
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [showPlusOneOtherInput, setShowPlusOneOtherInput] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RsvpFormData>({
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
    },
  });

  useEffect(() => {
    if (currentRsvp) {
      setValue("name", currentRsvp.name);
      setValue("email", currentRsvp.email);
      setValue("dietaryPreferences", currentRsvp.dietaryPreferences);
      if (currentRsvp.dietaryPreferences.includes("other")) {
        setShowOtherInput(true);
        setValue(
          "otherDietaryPreference",
          currentRsvp.otherDietaryPreference || ""
        );
      } else {
        setShowOtherInput(false);
        setValue("otherDietaryPreference", "");
      }
      setValue("hasPlusOne", currentRsvp.hasPlusOne);
      setValue("plusOneName", currentRsvp.plusOneName || "");
      setValue("plusOneEmail", currentRsvp.plusOneEmail || "");
      setValue(
        "plusOneDietaryPreferences",
        currentRsvp.plusOneDietaryPreferences || []
      );
      if (currentRsvp.plusOneDietaryPreferences?.includes("other")) {
        setShowPlusOneOtherInput(true);
        setValue(
          "plusOneOtherDietaryPreference",
          currentRsvp.plusOneOtherDietaryPreference || ""
        );
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
      const payload = {
        ...data,
        plusOneName: data.hasPlusOne ? data.plusOneName : undefined,
        plusOneEmail: data.hasPlusOne ? data.plusOneEmail : undefined,
        plusOneDietaryPreferences: data.hasPlusOne
          ? data.plusOneDietaryPreferences
          : undefined,
        plusOneOtherDietaryPreference:
          data.hasPlusOne && data.plusOneDietaryPreferences?.includes("other")
            ? data.plusOneOtherDietaryPreference
            : undefined,
        otherDietaryPreference: data.dietaryPreferences.includes("other")
          ? data.otherDietaryPreference
          : undefined,
      };
      await submitRsvp(payload);
      toast.success(
        currentRsvp
          ? "RSVP updated successfully!"
          : "RSVP submitted successfully! We can't wait to celebrate with you!"
      );
    } catch (error) {
      console.error("RSVP submission error:", error);
      toast.error("Failed to submit RSVP. Please try again.");
    }
  };

  const toggleDietaryPreference = (
    field: "dietaryPreferences" | "plusOneDietaryPreferences",
    preference: DietaryOption | "other"
  ) => {
    const currentPrefs = watch(field) || [];
    const newPrefs = currentPrefs.includes(preference)
      ? currentPrefs.filter((p) => p !== preference)
      : [...currentPrefs, preference];
    setValue(field, newPrefs, { shouldValidate: true });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      style={{
        fontFamily: 'Georgia, Times, "Times New Roman", serif',
        background: OFFWHITE,
        border: `1px solid ${GOLD}`,
        padding: 32,
        marginTop: 32,
        marginBottom: 32,
      }}
    >
      <div
        style={{
          borderBottom: `1px solid ${GOLD}`,
          marginBottom: 24,
          paddingBottom: 12,
        }}
      >
        <h3
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: "#222",
            textTransform: "uppercase",
            letterSpacing: 2,
            fontFamily: "Georgia, serif",
          }}
        >
          RSVP
        </h3>
        <p
          style={{
            fontSize: 15,
            color: "#444",
            fontStyle: "italic",
            marginTop: 4,
          }}
        >
          Let us know if you can join the celebration!
        </p>
      </div>
      <div
        style={{ display: "flex", flexWrap: "wrap", gap: 24, marginBottom: 24 }}
      >
        <div style={{ flex: 1, minWidth: 220 }}>
          <label
            htmlFor="name"
            style={{
              display: "block",
              fontSize: 14,
              fontWeight: 600,
              color: "#444",
              textTransform: "uppercase",
              letterSpacing: 1,
              marginBottom: 4,
            }}
          >
            Full Name
          </label>
          <input
            id="name"
            {...register("name")}
            style={{
              width: "100%",
              padding: 8,
              border: `1px solid ${GOLD}`,
              fontFamily: "Georgia, serif",
              fontSize: 15,
              background: "#fff",
              color: "#222",
              marginBottom: 4,
            }}
          />
          {errors.name && (
            <p style={{ color: "#b91c1c", fontSize: 12 }}>
              {errors.name.message}
            </p>
          )}
        </div>
        <div style={{ flex: 1, minWidth: 220 }}>
          <label
            htmlFor="email"
            style={{
              display: "block",
              fontSize: 14,
              fontWeight: 600,
              color: "#444",
              textTransform: "uppercase",
              letterSpacing: 1,
              marginBottom: 4,
            }}
          >
            Email Address
          </label>
          <input
            id="email"
            type="email"
            {...register("email")}
            style={{
              width: "100%",
              padding: 8,
              border: `1px solid ${GOLD}`,
              fontFamily: "Georgia, serif",
              fontSize: 15,
              background: "#fff",
              color: "#222",
              marginBottom: 4,
            }}
          />
          {errors.email && (
            <p style={{ color: "#b91c1c", fontSize: 12 }}>
              {errors.email.message}
            </p>
          )}
        </div>
      </div>
      <DietaryPreferencesSection
        title="What can't you eat?"
        preferences={mainGuestDietaryPrefs || []}
        onToggle={(pref) => toggleDietaryPreference("dietaryPreferences", pref)}
        showOtherInput={showOtherInput}
        otherInputProps={register("otherDietaryPreference")}
        error={
          errors.dietaryPreferences?.message ||
          errors.otherDietaryPreference?.message
        }
      />
      <div style={{ margin: "24px 0" }}>
        <label
          htmlFor="hasPlusOne"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            cursor: "pointer",
            fontSize: 14,
            color: "#444",
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          <Controller
            name="hasPlusOne"
            control={control}
            render={({ field }) => (
              <input
                type="checkbox"
                checked={field.value}
                onChange={() => field.onChange(!field.value)}
                style={{
                  accentColor: GOLD,
                  width: 18,
                  height: 18,
                  marginRight: 8,
                }}
              />
            )}
          />
          Bringing a guest?
          {hasPlusOne ? (
            <UserPlus className="w-5 h-5" style={{ color: GOLD }} />
          ) : (
            <UserPlus className="w-5 h-5" style={{ color: "#bbb" }} />
          )}
        </label>
      </div>
      {hasPlusOne && (
        <div
          style={{
            background: "#fff",
            border: `1px solid ${GOLD}`,
            borderRadius: 0,
            padding: 18,
            marginBottom: 24,
          }}
        >
          <h3
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: GOLD,
              textTransform: "uppercase",
              letterSpacing: 1,
              marginBottom: 8,
            }}
          >
            Guest's Details
          </h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
            <div style={{ flex: 1, minWidth: 220 }}>
              <label
                htmlFor="plusOneName"
                style={{
                  display: "block",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#444",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  marginBottom: 4,
                }}
              >
                Guest's Full Name
              </label>
              <input
                id="plusOneName"
                {...register("plusOneName")}
                style={{
                  width: "100%",
                  padding: 8,
                  border: `1px solid ${GOLD}`,
                  fontFamily: "Georgia, serif",
                  fontSize: 15,
                  background: "#fff",
                  color: "#222",
                  marginBottom: 4,
                }}
              />
              {errors.plusOneName && (
                <p style={{ color: "#b91c1c", fontSize: 12 }}>
                  {errors.plusOneName.message}
                </p>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 220 }}>
              <label
                htmlFor="plusOneEmail"
                style={{
                  display: "block",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#444",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  marginBottom: 4,
                }}
              >
                Guest's Email Address
              </label>
              <input
                id="plusOneEmail"
                type="email"
                {...register("plusOneEmail")}
                style={{
                  width: "100%",
                  padding: 8,
                  border: `1px solid ${GOLD}`,
                  fontFamily: "Georgia, serif",
                  fontSize: 15,
                  background: "#fff",
                  color: "#222",
                  marginBottom: 4,
                }}
              />
              {errors.plusOneEmail && (
                <p style={{ color: "#b91c1c", fontSize: 12 }}>
                  {errors.plusOneEmail.message}
                </p>
              )}
            </div>
          </div>
          <DietaryPreferencesSection
            title="What can't your guest eat?"
            preferences={plusOneDietaryPrefs || []}
            onToggle={(pref) =>
              toggleDietaryPreference("plusOneDietaryPreferences", pref)
            }
            showOtherInput={showPlusOneOtherInput}
            otherInputProps={register("plusOneOtherDietaryPreference")}
            error={
              errors.plusOneDietaryPreferences?.message ||
              errors.plusOneOtherDietaryPreference?.message
            }
          />
        </div>
      )}
      {errors.root?.hasPlusOne && (
        <p style={{ color: "#b91c1c", fontSize: 12 }}>
          {errors.root.hasPlusOne.message}
        </p>
      )}
      <button
        type="submit"
        disabled={isSubmitting}
        style={{
          width: "100%",
          padding: "12px 0",
          border: `1.5px solid ${GOLD}`,
          background: "#fff",
          color: GOLD,
          fontFamily: "Georgia, serif",
          fontSize: 18,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: 2,
          cursor: isSubmitting ? "not-allowed" : "pointer",
          opacity: isSubmitting ? 0.7 : 1,
          marginTop: 24,
        }}
      >
        {isSubmitting ? (
          <span style={{ fontStyle: "italic", color: "#aaa" }}>
            Submitting...
          </span>
        ) : (
          <span>{currentRsvp ? "Update RSVP" : "Submit RSVP"}</span>
        )}
      </button>
    </form>
  );
}

interface DietaryPreferencesSectionProps {
  title: string;
  preferences: string[];
  onToggle: (preference: DietaryOption | "other") => void;
  showOtherInput: boolean;
  otherInputProps: any;
  error?: string;
}

function DietaryChip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "6px 18px",
        fontSize: 14,
        border: `1px solid ${GOLD}`,
        borderRadius: 0,
        background: selected ? GOLD : "#fff",
        color: selected ? "#fff" : "#444",
        fontFamily: "Georgia, serif",
        marginRight: 8,
        marginBottom: 8,
        cursor: "pointer",
        textTransform: "capitalize",
        fontWeight: selected ? 700 : 400,
        letterSpacing: 1,
      }}
    >
      {label}
    </button>
  );
}

function DietaryPreferencesSection({
  title,
  preferences,
  onToggle,
  showOtherInput,
  otherInputProps,
  error,
}: DietaryPreferencesSectionProps) {
  return (
    <div style={{ margin: "24px 0" }}>
      <p
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: "#444",
          textTransform: "uppercase",
          letterSpacing: 1,
          marginBottom: 8,
        }}
      >
        {title}
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 0 }}>
        {dietaryOptions.map((opt) => (
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
        <div style={{ marginTop: 12 }}>
          <label
            htmlFor={otherInputProps.name}
            style={{
              display: "block",
              fontSize: 13,
              color: "#666",
              fontStyle: "italic",
              marginBottom: 4,
            }}
          >
            Please specify "Other":
          </label>
          <input
            id={otherInputProps.name}
            {...otherInputProps}
            style={{
              width: "100%",
              padding: 8,
              border: `1px solid ${GOLD}`,
              fontFamily: "Georgia, serif",
              fontSize: 15,
              background: "#fff",
              color: "#222",
            }}
            placeholder="e.g., Nuts, Soy"
          />
        </div>
      )}
      {error && (
        <p style={{ color: "#b91c1c", fontSize: 12, marginTop: 4 }}>{error}</p>
      )}
    </div>
  );
}
