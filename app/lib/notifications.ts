
import { prisma } from './db';
import { NotificationType } from '@prisma/client';

interface BookingConfirmationData {
  bookingId: string;
  customerName: string;
  venueName: string;
  venueAddress: string;
  venuePhone: string;
  date: string;
  time: string;
  partySize: number;
  serviceType: string;
  specialRequests?: string;
}

export async function sendBookingConfirmation(
  customerEmail: string,
  data: BookingConfirmationData
): Promise<void> {
  try {
    // In a real application, you would integrate with an email service like SendGrid, Mailgun, etc.
    // For now, we'll just log the email content and create a notification record
    
    const emailContent = generateBookingConfirmationEmail(data);
    
    console.log('Booking confirmation email would be sent to:', customerEmail);
    console.log('Email content:', emailContent);
    
    // Store email template usage for analytics
    await prisma.emailTemplate.upsert({
      where: { name: 'booking_confirmation' },
      update: {},
      create: {
        name: 'booking_confirmation',
        subject: 'Booking Confirmation - {{venueName}}',
        htmlBody: emailContent.html,
        textBody: emailContent.text,
        isActive: true,
      },
    });
  } catch (error) {
    console.error('Failed to send booking confirmation email:', error);
    // Don't throw error to prevent booking creation from failing
  }
}

export async function sendBookingReminder(
  customerEmail: string,
  data: BookingConfirmationData
): Promise<void> {
  try {
    const emailContent = generateBookingReminderEmail(data);
    
    console.log('Booking reminder email would be sent to:', customerEmail);
    console.log('Email content:', emailContent);
    
    await prisma.emailTemplate.upsert({
      where: { name: 'booking_reminder' },
      update: {},
      create: {
        name: 'booking_reminder',
        subject: 'Booking Reminder - {{venueName}}',
        htmlBody: emailContent.html,
        textBody: emailContent.text,
        isActive: true,
      },
    });
  } catch (error) {
    console.error('Failed to send booking reminder email:', error);
  }
}

export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  metadata?: any
): Promise<void> {
  try {
    await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        metadata: metadata || {},
      },
    });
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
  try {
    await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
  }
}

export async function getUserNotifications(userId: string, limit = 10) {
  try {
    return await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  } catch (error) {
    console.error('Failed to get user notifications:', error);
    return [];
  }
}

function generateBookingConfirmationEmail(data: BookingConfirmationData) {
  const serviceTypeLabel = getServiceTypeLabel(data.serviceType);
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Booking Confirmation</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #3b82f6; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; margin: 10px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        .button { background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Booking Confirmed!</h1>
          <p>Your reservation at ${data.venueName} has been confirmed</p>
        </div>
        
        <div class="content">
          <p>Dear ${data.customerName},</p>
          <p>Thank you for your booking! We're excited to welcome you to ${data.venueName}.</p>
          
          <div class="booking-details">
            <h3>Booking Details</h3>
            <div class="detail-row">
              <strong>Booking ID:</strong>
              <span>${data.bookingId.slice(-8)}</span>
            </div>
            <div class="detail-row">
              <strong>Date:</strong>
              <span>${data.date}</span>
            </div>
            <div class="detail-row">
              <strong>Time:</strong>
              <span>${data.time}</span>
            </div>
            <div class="detail-row">
              <strong>Party Size:</strong>
              <span>${data.partySize} ${data.partySize === 1 ? 'guest' : 'guests'}</span>
            </div>
            <div class="detail-row">
              <strong>Service Type:</strong>
              <span>${serviceTypeLabel}</span>
            </div>
            ${data.specialRequests ? `
            <div class="detail-row">
              <strong>Special Requests:</strong>
              <span>${data.specialRequests}</span>
            </div>
            ` : ''}
          </div>
          
          <div class="booking-details">
            <h3>Venue Information</h3>
            <p><strong>${data.venueName}</strong></p>
            <p>${data.venueAddress}</p>
            <p>Phone: ${data.venuePhone}</p>
          </div>
          
          <p>If you need to make any changes or cancel your booking, please contact the venue directly.</p>
          
          <p>We look forward to seeing you!</p>
        </div>
        
        <div class="footer">
          <p>This email was sent by Sully Booking System</p>
          <p>If you have any questions, please contact ${data.venueName} directly at ${data.venuePhone}</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const text = `
    Booking Confirmed!
    
    Dear ${data.customerName},
    
    Thank you for your booking! We're excited to welcome you to ${data.venueName}.
    
    Booking Details:
    - Booking ID: ${data.bookingId.slice(-8)}
    - Date: ${data.date}
    - Time: ${data.time}
    - Party Size: ${data.partySize} ${data.partySize === 1 ? 'guest' : 'guests'}
    - Service Type: ${serviceTypeLabel}
    ${data.specialRequests ? `- Special Requests: ${data.specialRequests}` : ''}
    
    Venue Information:
    ${data.venueName}
    ${data.venueAddress}
    Phone: ${data.venuePhone}
    
    If you need to make any changes or cancel your booking, please contact the venue directly.
    
    We look forward to seeing you!
    
    ---
    This email was sent by Sully Booking System
    If you have any questions, please contact ${data.venueName} directly at ${data.venuePhone}
  `;
  
  return { html, text };
}

function generateBookingReminderEmail(data: BookingConfirmationData) {
  const serviceTypeLabel = getServiceTypeLabel(data.serviceType);
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Booking Reminder</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #10b981; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; margin: 10px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Booking Reminder</h1>
          <p>Don't forget about your reservation at ${data.venueName}</p>
        </div>
        
        <div class="content">
          <p>Dear ${data.customerName},</p>
          <p>This is a friendly reminder about your upcoming reservation at ${data.venueName}.</p>
          
          <div class="booking-details">
            <h3>Your Booking</h3>
            <div class="detail-row">
              <strong>Date:</strong>
              <span>${data.date}</span>
            </div>
            <div class="detail-row">
              <strong>Time:</strong>
              <span>${data.time}</span>
            </div>
            <div class="detail-row">
              <strong>Party Size:</strong>
              <span>${data.partySize} ${data.partySize === 1 ? 'guest' : 'guests'}</span>
            </div>
            <div class="detail-row">
              <strong>Service Type:</strong>
              <span>${serviceTypeLabel}</span>
            </div>
          </div>
          
          <p>We're looking forward to welcoming you! If you need to make any changes, please contact us as soon as possible.</p>
          
          <p><strong>Contact:</strong> ${data.venuePhone}</p>
        </div>
        
        <div class="footer">
          <p>This reminder was sent by Sully Booking System</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const text = `
    Booking Reminder
    
    Dear ${data.customerName},
    
    This is a friendly reminder about your upcoming reservation at ${data.venueName}.
    
    Your Booking:
    - Date: ${data.date}
    - Time: ${data.time}
    - Party Size: ${data.partySize} ${data.partySize === 1 ? 'guest' : 'guests'}
    - Service Type: ${serviceTypeLabel}
    
    We're looking forward to welcoming you! If you need to make any changes, please contact us as soon as possible.
    
    Contact: ${data.venuePhone}
    
    ---
    This reminder was sent by Sully Booking System
  `;
  
  return { html, text };
}

function getServiceTypeLabel(type: string): string {
  switch (type) {
    case 'DINE_IN': return 'Dine In';
    case 'TAKEAWAY': return 'Takeaway';
    case 'DELIVERY': return 'Delivery';
    case 'EVENT': return 'Event';
    default: return type;
  }
}
