
import { Order, OrderStatus } from '../types';

/**
 * Placeholder service for sending transactional emails.
 * In a production environment, this would connect to an API (e.g., SendGrid, AWS SES, Mailgun).
 */
export const sendConfirmationEmail = async (order: Order): Promise<boolean> => {
  return new Promise((resolve) => {
    // Construct the email body
    const emailSubject = `Order Confirmation - Tracking #${order.id}`;
    const trackingUrl = `${window.location.origin}/#/tracking?id=${order.id}`;
    
    const emailBody = `
----------------------------------------------------
[MOCK EMAIL SERVICE]
To: ${order.email}
Subject: ${emailSubject}
----------------------------------------------------
Dear ${order.clientName},

Thank you for choosing DesignFlow! Your order has been successfully placed and is now Pending Review.

== ORDER DETAILS ==
ID: ${order.id}
Service: ${order.serviceType}
Price: $${order.price}
Estimated Completion: ${order.estimatedCompletion}

== CREATIVE BRIEF ==
Industry: ${order.industry}
Keywords: ${order.keywords || 'N/A'}

You can track the live status of your design here:
${trackingUrl}

We will be in touch shortly if we need any more details.

Best regards,
The DesignFlow Team
----------------------------------------------------
    `;

    // Simulate network latency (1.5 seconds)
    setTimeout(() => {
      console.log(emailBody); // Log to console for developer verification
      resolve(true);
    }, 1500);
  });
};

export const sendStatusUpdateEmail = async (order: Order, newStatus: OrderStatus): Promise<boolean> => {
  return new Promise((resolve) => {
    const trackingUrl = `${window.location.origin}/#/tracking?id=${order.id}`;
    let subject = `Update on Order #${order.id}`;
    let message = "";

    switch (newStatus) {
      case OrderStatus.REVIEWING:
        subject = `We are reviewing your order #${order.id}`;
        message = `We have received your requirements and are currently reviewing them to ensure we have everything we need. We will start processing shortly.`;
        break;
      case OrderStatus.IN_PROGRESS:
        subject = `Work Started: Order #${order.id}`;
        message = `Great news! Work has officially begun on your project. sit tight, we are crafting something amazing.`;
        break;
      case OrderStatus.DRAFT_SENT:
        subject = `Draft Ready: Order #${order.id}`;
        message = `A draft is ready for your review! Please visit the tracking link below to view the draft and provide feedback or approve it.`;
        break;
      case OrderStatus.WAITING_PAYMENT:
        subject = `Payment Required: Order #${order.id}`;
        message = `Thank you for approving the draft! Your project is now waiting for payment verification. Please contact the admin to complete the payment so we can release the final files.`;
        break;
      case OrderStatus.COMPLETED:
        subject = `Project Completed: Order #${order.id}`;
        message = `Your project has been marked as Completed! You can now download your final assets. Thank you for working with us!`;
        break;
      case OrderStatus.REVISION:
        subject = `Revision Request Received: Order #${order.id}`;
        message = `We have received your revision request. We will review your notes and get back to work on the changes.`;
        break;
      default:
        message = `The status of your order has been updated to: ${newStatus}`;
    }

    const emailBody = `
----------------------------------------------------
[MOCK EMAIL SERVICE]
To: ${order.email}
Subject: ${subject}
----------------------------------------------------
Dear ${order.clientName},

${message}

You can track progress here:
${trackingUrl}

Best regards,
Ranthula Am
----------------------------------------------------
    `;

    setTimeout(() => {
      console.log("STATUS UPDATE EMAIL SENT:", emailBody);
      resolve(true);
    }, 1000);
  });
};