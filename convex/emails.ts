import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = mutation({
    args: {
        subject: v.string(),
        body: v.string(),
        testEmail: v.optional(v.string()),
    },
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

        try {
            const response = await resend.emails.send({
                from: "Marlan's 40th Birthday <birthday@stuntedchicken.co.za>",
                to: recipients,
                replyTo: "marlan.perumal@gmail.com",
                subject: args.subject,
                html: args.body,
            });

            return {
                success: true,
                recipients: recipients.length
            };
        } catch (error: any) {
            throw new Error(`Failed to send email: ${error?.message || 'Unknown error'}`);
        }
    },
}); 