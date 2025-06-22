"use strict";exports.id=7752,exports.ids=[7752],exports.modules={4589:(e,i,n)=>{n.d(i,{gR:()=>o});var t=n(9487),a=n(53524);async function o(e,i,n,o,r,s){let l=i.getDay(),u=await t._.venueOpeningHours.findMany({where:{venueId:e,dayOfWeek:l,isActive:!0},orderBy:{openTime:"asc"}});if(0===u.length)return{available:!1,reason:"Venue is closed on this day"};let[c,d]=n.split(":").map(Number),p=60*c+d,m=!1;for(let e of u){let[i,n]=e.openTime.split(":").map(Number),[t,a]=e.closeTime.split(":").map(Number),o=60*t+a;if(p>=60*i+n&&p<=o){m=!0;break}}if(!m)return{available:!1,reason:"Time is outside operating hours"};if(r===a.ServiceType.DINE_IN&&s){let e=await t._.table.findUnique({where:{id:s}});if(!e||!e.isActive)return{available:!1,reason:"Table is not available"};if(e.capacity<o)return{available:!1,reason:"Table capacity is insufficient"};let n=new Date(i);n.setHours(c,d,0,0);let r=new Date(n);for(let e of(r.setHours(r.getHours()+2),await t._.booking.findMany({where:{tableId:s,date:{gte:new Date(i.toDateString()),lt:new Date(new Date(i.toDateString()).getTime()+864e5)},status:{in:[a.BookingStatus.PENDING,a.BookingStatus.CONFIRMED]}}}))){let i=new Date(e.date),[t,a]=e.time.split(":").map(Number);i.setHours(t,a,0,0);let o=new Date(i);if(o.setMinutes(o.getMinutes()+e.duration),n<o&&r>i)return{available:!1,reason:"Table is already booked for this time"}}}if(r===a.ServiceType.DINE_IN&&!s){let r=await t._.venue.findUnique({where:{id:e}});if(!r)return{available:!1,reason:"Venue not found"};if((await t._.booking.findMany({where:{venueId:e,date:{gte:new Date(i.toDateString()),lt:new Date(new Date(i.toDateString()).getTime()+864e5)},time:n,status:{in:[a.BookingStatus.PENDING,a.BookingStatus.CONFIRMED]}}})).reduce((e,i)=>e+i.partySize,0)+o>r.capacity)return{available:!1,reason:"Venue capacity exceeded"}}return{available:!0}}},9487:(e,i,n)=>{n.d(i,{_:()=>a});var t=n(53524);let a=globalThis.prisma??new t.PrismaClient},76876:(e,i,n)=>{n.d(i,{Go:()=>r,gG:()=>s,jJ:()=>a,sc:()=>o});var t=n(9487);async function a(e,i){try{let n=function(e){let i=function(e){switch(e){case"DINE_IN":return"Dine In";case"TAKEAWAY":return"Takeaway";case"DELIVERY":return"Delivery";case"EVENT":return"Event";default:return e}}(e.serviceType);return{html:`
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
          <p>Your reservation at ${e.venueName} has been confirmed</p>
        </div>
        
        <div class="content">
          <p>Dear ${e.customerName},</p>
          <p>Thank you for your booking! We're excited to welcome you to ${e.venueName}.</p>
          
          <div class="booking-details">
            <h3>Booking Details</h3>
            <div class="detail-row">
              <strong>Booking ID:</strong>
              <span>${e.bookingId.slice(-8)}</span>
            </div>
            <div class="detail-row">
              <strong>Date:</strong>
              <span>${e.date}</span>
            </div>
            <div class="detail-row">
              <strong>Time:</strong>
              <span>${e.time}</span>
            </div>
            <div class="detail-row">
              <strong>Party Size:</strong>
              <span>${e.partySize} ${1===e.partySize?"guest":"guests"}</span>
            </div>
            <div class="detail-row">
              <strong>Service Type:</strong>
              <span>${i}</span>
            </div>
            ${e.specialRequests?`
            <div class="detail-row">
              <strong>Special Requests:</strong>
              <span>${e.specialRequests}</span>
            </div>
            `:""}
          </div>
          
          <div class="booking-details">
            <h3>Venue Information</h3>
            <p><strong>${e.venueName}</strong></p>
            <p>${e.venueAddress}</p>
            <p>Phone: ${e.venuePhone}</p>
          </div>
          
          <p>If you need to make any changes or cancel your booking, please contact the venue directly.</p>
          
          <p>We look forward to seeing you!</p>
        </div>
        
        <div class="footer">
          <p>This email was sent by Sully Booking System</p>
          <p>If you have any questions, please contact ${e.venueName} directly at ${e.venuePhone}</p>
        </div>
      </div>
    </body>
    </html>
  `,text:`
    Booking Confirmed!
    
    Dear ${e.customerName},
    
    Thank you for your booking! We're excited to welcome you to ${e.venueName}.
    
    Booking Details:
    - Booking ID: ${e.bookingId.slice(-8)}
    - Date: ${e.date}
    - Time: ${e.time}
    - Party Size: ${e.partySize} ${1===e.partySize?"guest":"guests"}
    - Service Type: ${i}
    ${e.specialRequests?`- Special Requests: ${e.specialRequests}`:""}
    
    Venue Information:
    ${e.venueName}
    ${e.venueAddress}
    Phone: ${e.venuePhone}
    
    If you need to make any changes or cancel your booking, please contact the venue directly.
    
    We look forward to seeing you!
    
    ---
    This email was sent by Sully Booking System
    If you have any questions, please contact ${e.venueName} directly at ${e.venuePhone}
  `}}(i);console.log("Booking confirmation email would be sent to:",e),console.log("Email content:",n),await t._.emailTemplate.upsert({where:{name:"booking_confirmation"},update:{},create:{name:"booking_confirmation",subject:"Booking Confirmation - {{venueName}}",htmlBody:n.html,textBody:n.text,isActive:!0}})}catch(e){console.error("Failed to send booking confirmation email:",e)}}async function o(e,i,n,a,o){try{await t._.notification.create({data:{userId:e,type:i,title:n,message:a,metadata:o||{}}})}catch(e){console.error("Failed to create notification:",e)}}async function r(e){try{await t._.notification.update({where:{id:e},data:{isRead:!0}})}catch(e){console.error("Failed to mark notification as read:",e)}}async function s(e,i=10){try{return await t._.notification.findMany({where:{userId:e},orderBy:{createdAt:"desc"},take:i})}catch(e){return console.error("Failed to get user notifications:",e),[]}}},86287:(e,i,n)=>{n.d(i,{EG:()=>u,GC:()=>s,XA:()=>o,ol:()=>c,sN:()=>r});var t=n(9487),a=n(53524);async function o(e){let i=await t._.subscription.findUnique({where:{venueId:e}});return i?{canCreateBooking:i.plan===a.SubscriptionPlan.PROFESSIONAL||i.plan===a.SubscriptionPlan.ENTERPRISE||null!==i.bookingsLimit&&i.bookingsUsed<i.bookingsLimit,bookingsUsed:i.bookingsUsed,bookingsLimit:i.bookingsLimit,plan:i.plan}:(await t._.subscription.create({data:{venueId:e,plan:a.SubscriptionPlan.STARTER,status:a.SubscriptionStatus.ACTIVE,currentPeriodStart:new Date,currentPeriodEnd:new Date(Date.now()+2592e6),bookingsLimit:50}}),{canCreateBooking:!0,bookingsUsed:0,bookingsLimit:50,plan:a.SubscriptionPlan.STARTER})}async function r(e){let i=await t._.subscription.findUnique({where:{venueId:e}}),n=i?.plan||a.SubscriptionPlan.STARTER;return{canUploadLogo:!0,canUploadHeader:!0,canUploadGallery:n===a.SubscriptionPlan.ENTERPRISE||n===a.SubscriptionPlan.PROFESSIONAL,maxGalleryImages:n===a.SubscriptionPlan.ENTERPRISE||n===a.SubscriptionPlan.PROFESSIONAL?20:0,plan:n}}async function s(e){await t._.subscription.update({where:{venueId:e},data:{bookingsUsed:{increment:1}}})}let l={FREE:{venues:1,bookingsPerMonth:50,galleryImages:0,analytics:!0,widgets:!0,customBranding:!1,prioritySupport:!1},PAID:{venues:5,bookingsPerMonth:null,galleryImages:20,analytics:!0,widgets:!0,customBranding:!0,prioritySupport:!1},PREMIUM:{venues:null,bookingsPerMonth:null,galleryImages:20,analytics:!0,widgets:!0,customBranding:!0,prioritySupport:!0}};async function u(e){let i;let n=await t._.venue.count({where:{ownerId:e}}),o=await t._.venue.findMany({where:{ownerId:e},include:{subscription:!0}}),r=a.SubscriptionPlan.STARTER;for(let e of o)if(e.subscription){if(e.subscription.plan===a.SubscriptionPlan.ENTERPRISE){r=a.SubscriptionPlan.ENTERPRISE;break}e.subscription.plan===a.SubscriptionPlan.PROFESSIONAL&&r===a.SubscriptionPlan.STARTER&&(r=a.SubscriptionPlan.PROFESSIONAL)}let s=l[r],u=null===s.venues||n<s.venues;return u||(i=`You've reached the venue limit for your ${r} plan (${s.venues} venue${1===s.venues?"":"s"}). Upgrade to create more venues.`),{canCreateVenue:u,venuesUsed:n,venuesLimit:s.venues,plan:r,message:i}}async function c(e){let i=await u(e),n=l[i.plan];return{plan:i.plan,venues:{used:i.venuesUsed,limit:i.venuesLimit},features:{bookingsPerMonth:n.bookingsPerMonth,galleryImages:n.galleryImages,analytics:n.analytics,widgets:n.widgets,customBranding:n.customBranding,prioritySupport:n.prioritySupport}}}},30971:(e,i,n)=>{n.d(i,{Tu:()=>s,WV:()=>u,Yy:()=>l,dm:()=>o,gY:()=>r,i6:()=>c,sY:()=>p,tw:()=>m});var t=n(7410),a=n(53524);let o=t.z.object({email:t.z.string().email("Invalid email address"),password:t.z.string().min(6,"Password must be at least 6 characters")}),r=t.z.object({email:t.z.string().email("Invalid email address"),password:t.z.string().min(6,"Password must be at least 6 characters"),firstName:t.z.string().min(1,"First name is required"),lastName:t.z.string().min(1,"Last name is required"),phone:t.z.string().optional()}),s=t.z.object({name:t.z.string().min(1,"Venue name is required"),description:t.z.string().optional(),address:t.z.string().min(1,"Address is required"),city:t.z.string().min(1,"City is required"),postcode:t.z.string().min(1,"Postcode is required"),phone:t.z.string().min(1,"Phone is required"),email:t.z.string().email("Invalid email address"),website:t.z.string().url().optional().or(t.z.literal("")),cuisine:t.z.string().optional(),venueType:t.z.nativeEnum(a.VenueType),capacity:t.z.number().min(1,"Capacity must be at least 1")}),l=t.z.object({venueId:t.z.string().min(1,"Venue is required"),serviceType:t.z.nativeEnum(a.ServiceType),date:t.z.string().min(1,"Date is required"),time:t.z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,"Invalid time format"),partySize:t.z.number().min(1,"Party size must be at least 1"),customerName:t.z.string().min(1,"Customer name is required"),customerEmail:t.z.string().email("Invalid email address"),customerPhone:t.z.string().min(1,"Phone number is required"),specialRequests:t.z.string().optional(),tableId:t.z.string().optional()}),u=t.z.object({name:t.z.string().min(1,"Table name is required"),capacity:t.z.number().min(1,"Capacity must be at least 1"),description:t.z.string().optional()});t.z.object({name:t.z.string().min(1,"Event name is required"),description:t.z.string().optional(),date:t.z.string().min(1,"Date is required"),startTime:t.z.string().min(1,"Start time is required"),endTime:t.z.string().min(1,"End time is required"),capacity:t.z.number().min(1,"Capacity must be at least 1"),price:t.z.number().min(0,"Price must be positive").optional()});let c=t.z.object({dayOfWeek:t.z.number().min(0).max(6),openTime:t.z.string().min(1,"Open time is required"),closeTime:t.z.string().min(1,"Close time is required"),isOpen:t.z.boolean()}),d=t.z.object({dayOfWeek:t.z.number().min(0).max(6),openTime:t.z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,"Invalid time format"),closeTime:t.z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,"Invalid time format"),name:t.z.string().optional(),isActive:t.z.boolean().default(!0)}),p=t.z.object({openingHours:t.z.array(d)}),m=t.z.object({name:t.z.string().min(1,"Widget name is required"),settings:t.z.object({theme:t.z.string().optional(),primaryColor:t.z.string().optional(),showLogo:t.z.boolean().optional(),allowedServices:t.z.array(t.z.nativeEnum(a.ServiceType)).optional()}).optional()})}};