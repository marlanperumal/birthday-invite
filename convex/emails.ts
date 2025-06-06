import { mutation, query, action } from "./_generated/server";
import { v } from "convex/values";
import { Resend } from "resend";
import { api } from "./_generated/api";

type EmailResult = {
    success: boolean;
    recipients: number;
};

// This action handles the actual email sending
export const sendEmailAction = action({
    args: {
        recipients: v.array(v.string()),
        subject: v.string(),
        body: v.string(),
    },
    handler: async (ctx, args) => {
        const resendApiKey = process.env.RESEND_API_KEY;
        console.log("RESEND_API_KEY", resendApiKey);
        if (!resendApiKey) {
            throw new Error("RESEND_API_KEY environment variable is not set");
        }


        try {
            console.log("Attempting to send email to", args.recipients);
            const res = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${resendApiKey}`,
                },
                body: JSON.stringify({
                    from: "Marlan's 40th Birthday <birthday@stuntedchicken.co.za>",
                    to: args.recipients,
                    reply_to: "marlan.perumal@gmail.com",
                    subject: args.subject,
                    html: args.body,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                console.log("Email sent successfully:", data);
                return data;
            } else {
                console.error("Email sending error:", res);
                throw new Error(`Failed to send email: ${res.statusText || 'Unknown error'}`);
            }

        } catch (error: any) {
            console.error("Email sending error:", error);
            if (error.response?.data) {
                console.error("Resend API detailed error:", error.response.data);
            }
            throw new Error(`Failed to send email: ${error?.message || 'Unknown error'}`);
        }
    },
});

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
        await ctx.scheduler.runAfter(0, api.emails.sendEmailAction, {
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