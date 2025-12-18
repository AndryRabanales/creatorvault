import nodemailer from 'nodemailer';
import { ENV } from '../_core/env';

// Email templates
const templates = {
    applicationReceived: (creatorName: string, campaignTitle: string) => `
    <h2>Application Received</h2>
    <p>Hi ${creatorName},</p>
    <p>We've received your application for the campaign: <strong>${campaignTitle}</strong></p>
    <p>The brand will review your application and get back to you soon.</p>
    <p>Thanks,<br/>CreatorVault Team</p>
  `,

    applicationApproved: (creatorName: string, campaignTitle: string) => `
    <h2>Congratulations! 🎉</h2>
    <p>Hi ${creatorName},</p>
    <p>Great news! You've been approved for: <strong>${campaignTitle}</strong></p>
    <p>Please sign your contract to get started.</p>
    <p>Login to your dashboard: https://creatorvault-production.up.railway.app/dashboard</p>
    <p>Thanks,<br/>CreatorVault Team</p>
  `,

    paymentCompleted: (creatorName: string, amount: number) => `
    <h2>Payment Completed</h2>
    <p>Hi ${creatorName},</p>
    <p>Your payment of <strong>$${amount.toLocaleString()}</strong> has been processed.</p>
    <p>You should receive it in your account within 1-2 business days.</p>
    <p>Thanks,<br/>CreatorVault Team</p>
  `,

    newApplicant: (brandName: string, creatorName: string, campaignTitle: string) => `
    <h2>New Creator Application</h2>
    <p>Hi ${brandName},</p>
    <p><strong>${creatorName}</strong> has applied to your campaign: ${campaignTitle}</p>
    <p>Review their application: https://creatorvault-production.up.railway.app/brand/dashboard</p>
    <p>Thanks,<br/>CreatorVault Team</p>
  `,

    deliverableSubmitted: (brandName: string, creatorName: string, campaignTitle: string) => `
    <h2>Deliverable Submitted</h2>
    <p>Hi ${brandName},</p>
    <p><strong>${creatorName}</strong> has submitted deliverables for: ${campaignTitle}</p>
    <p>Please review and approve: https://creatorvault-production.up.railway.app/brand/dashboard</p>
    <p>Thanks,<br/>CreatorVault Team</p>
  `,
};

// Create transporter (using Gmail for MVP, can switch to SendGrid later)
const createTransporter = () => {
    if (!ENV.emailUser || !ENV.emailPassword) {
        console.warn('[Email] Email credentials not configured. Emails will not send.');
        return null;
    }

    return nodemailer.createTransporter({
        service: 'gmail',
        auth: {
            user: ENV.emailUser,
            pass: ENV.emailPassword,
        },
    });
};

export const sendEmail = async (to: string, subject: string, html: string) => {
    const transporter = createTransporter();

    if (!transporter) {
        console.log(`[Email] Would send to ${to}: ${subject}`);
        return;
    }

    try {
        await transporter.sendMail({
            from: `"CreatorVault" <${ENV.emailUser}>`,
            to,
            subject,
            html,
        });
        console.log(`[Email] Sent to ${to}: ${subject}`);
    } catch (error) {
        console.error('[Email] Failed to send:', error);
    }
};

export const emailService = {
    applicationReceived: (to: string, creatorName: string, campaignTitle: string) =>
        sendEmail(to, 'Application Received - CreatorVault', templates.applicationReceived(creatorName, campaignTitle)),

    applicationApproved: (to: string, creatorName: string, campaignTitle: string) =>
        sendEmail(to, 'You\'ve been approved! 🎉 - CreatorVault', templates.applicationApproved(creatorName, campaignTitle)),

    paymentCompleted: (to: string, creatorName: string, amount: number) =>
        sendEmail(to, 'Payment Completed - CreatorVault', templates.paymentCompleted(creatorName, amount)),

    newApplicant: (to: string, brandName: string, creatorName: string, campaignTitle: string) =>
        sendEmail(to, 'New Creator Application - CreatorVault', templates.newApplicant(brandName, creatorName, campaignTitle)),

    deliverableSubmitted: (to: string, brandName: string, creatorName: string, campaignTitle: string) =>
        sendEmail(to, 'Deliverable Submitted - CreatorVault', templates.deliverableSubmitted(brandName, creatorName, campaignTitle)),
};
