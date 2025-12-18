import cron from "node-cron";
import * as db from "./db";

export function initScheduler() {
    console.log("[Scheduler] Initializing background jobs...");

    // Run at 00:00 on the 1st of every month
    // Format: Minute Hour DayMonth Month DayWeek
    cron.schedule("0 0 1 * *", async () => {
        console.log("[Scheduler] Running Monthly Guaranteed Income Job...");
        try {
            const creators = await db.getAllCreators();
            let processedCount = 0;

            for (const creator of creators) {
                // Skip if income is 0 or string is empty/invalid
                const income = parseFloat(creator.guaranteedIncome || "0");
                if (income <= 0) continue;

                console.log(`[Scheduler] Processing guaranteed payout for ${creator.name} (ID: ${creator.id}): $${income.toFixed(2)}`);

                // Create payment record
                // Status is PENDING so it can be picked up by a separate Stripe Payout worker or manual review
                await db.createPayment({
                    creatorId: creator.id,
                    type: "guaranteed",
                    amount: income.toFixed(2),
                    netAmount: income.toFixed(2), // 100% goes to creator for guaranteed income (unless platform takes cut?)
                    platformFee: "0.00",        // Assuming no fee on base salary for now
                    status: "pending",
                    scheduledFor: new Date(),
                });

                // Create notification
                await db.createNotification({
                    userId: creator.userId,
                    type: "payment_received",
                    title: "Guaranteed Income Processed",
                    message: `Your monthly guaranteed income of $${income.toFixed(2)} has been processed.`,
                    link: "/dashboard/creator/payments"
                });

                processedCount++;
            }
            console.log(`[Scheduler] Monthly Job Completed. Processed ${processedCount} creators.`);
        } catch (error) {
            console.error("[Scheduler] Error in Monthly Job:", error);
        }
    });

    console.log("[Scheduler] Jobs scheduled: [Monthly Guaranteed Income]");
}
