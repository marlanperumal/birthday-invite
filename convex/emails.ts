import { mutation, query, action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { Resend } from "resend";

type EmailResult = {
    success: boolean;
    recipients: number;
};

// This mutation will be called by the frontend and delegates to the action
export const sendEmail = mutation({
    args: {
        subject: v.string(),
        body: v.string(),
        testEmail: v.optional(v.string()),
    },
    returns: v.object({
        success: v.boolean(),
        recipients: v.number(),
    }),
    handler: async (ctx, args) => {
        // Get all RSVPs
        const rsvps = await ctx.db.query("rsvps").collect();

        // Extract and dedupe email addresses
        const emailSet = new Set<string>();
        rsvps.forEach(rsvp => {
            if (rsvp.email) emailSet.add(rsvp.email);
            if (rsvp.hasPlusOne && rsvp.plusOneEmail) emailSet.add(rsvp.plusOneEmail);
        });

        // If testEmail is provided, only send to that address
        const recipients = args.testEmail ? [args.testEmail] : Array.from(emailSet);

        if (recipients.length === 0) {
            throw new Error("No recipients found");
        }

        // Schedule the action and return immediately
        await ctx.scheduler.runAfter(0, internal.emails.sendEmailAction, {
            recipients,
            subject: args.subject,
            body: args.body,
        });

        // Return the number of recipients that will be processed
        return {
            success: true,
            recipients: recipients.length
        };
    },
});

// This action handles the actual email sending
export const sendEmailAction = action({
    args: {
        recipients: v.array(v.string()),
        subject: v.string(),
        body: v.string(),
    },
    handler: async (ctx, args) => {
        const resendApiKey = process.env.RESEND_API_KEY;
        if (!resendApiKey) {
            throw new Error("RESEND_API_KEY environment variable is not set");
        }

        const resend = new Resend(resendApiKey);

        try {
            console.log("Attempting to send email to", args.recipients);

            const { data, error } = await resend.emails.send({
                from: "Marlan's 40th Birthday <birthday@stuntedchicken.co.za>",
                to: args.recipients,
                replyTo: "marlan.perumal@gmail.com",
                subject: args.subject,
                html: args.body,
            });

            console.log("Resend API response:", { data, error });

            if (error) {
                console.error("Resend API error:", error);
                throw new Error(`Failed to send email: ${error.message || 'Unknown error'}`);
            }

            console.log("Email sent successfully:", data);
            return {
                success: true,
                recipients: args.recipients.length
            };
        } catch (error: any) {
            console.error("Email sending error:", error);
            if (error.response?.data) {
                console.error("Resend API detailed error:", error.response.data);
            }
            throw new Error(`Failed to send email: ${error?.message || 'Unknown error'}`);
        }
    },
}); 