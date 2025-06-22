exports.id=9295,exports.ids=[9295],exports.modules={36242:(e,i,t)=>{"use strict";t.d(i,{LO:()=>a,Ss:()=>s,UI:()=>o,bA:()=>r});var n=t(62686);async function a(e,i){try{let t=function(e){let i=function(e){switch(e){case"DINE_IN":return"Dine In";case"TAKEAWAY":return"Takeaway";case"DELIVERY":return"Delivery";case"EVENT":return"Event";default:return e}}(e.serviceType);return{html:`
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
  `}}(i);console.log("Booking confirmation email would be sent to:",e),console.log("Email content:",t),await n.z.emailTemplate.upsert({where:{name:"booking_confirmation"},update:{},create:{name:"booking_confirmation",subject:"Booking Confirmation - {{venueName}}",htmlBody:t.html,textBody:t.text,isActive:!0}})}catch(e){console.error("Failed to send booking confirmation email:",e)}}async function o(e,i,t,a,o){try{await n.z.notification.create({data:{userId:e,type:i,title:t,message:a,metadata:o||{}}})}catch(e){console.error("Failed to create notification:",e)}}async function r(e){try{await n.z.notification.update({where:{id:e},data:{isRead:!0}})}catch(e){console.error("Failed to mark notification as read:",e)}}async function s(e,i=10){try{return await n.z.notification.findMany({where:{userId:e},orderBy:{createdAt:"desc"},take:i})}catch(e){return console.error("Failed to get user notifications:",e),[]}}},43331:()=>{},44069:(e,i,t)=>{"use strict";t.d(i,{ZT:()=>c,dL:()=>r,gJ:()=>s,jI:()=>u,k:()=>o});var n=t(62686),a=t(96330);async function o(e){let i=await n.z.subscription.findUnique({where:{venueId:e}});return i?{canCreateBooking:i.plan===a.SubscriptionPlan.PROFESSIONAL||i.plan===a.SubscriptionPlan.ENTERPRISE||null!==i.bookingsLimit&&i.bookingsUsed<i.bookingsLimit,bookingsUsed:i.bookingsUsed,bookingsLimit:i.bookingsLimit,plan:i.plan}:(await n.z.subscription.create({data:{venueId:e,plan:a.SubscriptionPlan.STARTER,status:a.SubscriptionStatus.ACTIVE,currentPeriodStart:new Date,currentPeriodEnd:new Date(Date.now()+2592e6),bookingsLimit:50}}),{canCreateBooking:!0,bookingsUsed:0,bookingsLimit:50,plan:a.SubscriptionPlan.STARTER})}async function r(e){let i=await n.z.subscription.findUnique({where:{venueId:e}}),t=i?.plan||a.SubscriptionPlan.STARTER;return{canUploadLogo:!0,canUploadHeader:!0,canUploadGallery:t===a.SubscriptionPlan.ENTERPRISE||t===a.SubscriptionPlan.PROFESSIONAL,maxGalleryImages:20*(t===a.SubscriptionPlan.ENTERPRISE||t===a.SubscriptionPlan.PROFESSIONAL),plan:t}}async function s(e){await n.z.subscription.update({where:{venueId:e},data:{bookingsUsed:{increment:1}}})}let l={FREE:{venues:1,bookingsPerMonth:50,galleryImages:0,analytics:!0,widgets:!0,customBranding:!1,prioritySupport:!1},PAID:{venues:5,bookingsPerMonth:null,galleryImages:20,analytics:!0,widgets:!0,customBranding:!0,prioritySupport:!1},PREMIUM:{venues:null,bookingsPerMonth:null,galleryImages:20,analytics:!0,widgets:!0,customBranding:!0,prioritySupport:!0}};async function u(e){let i,t=await n.z.venue.count({where:{ownerId:e}}),o=await n.z.venue.findMany({where:{ownerId:e},include:{subscription:!0}}),r=a.SubscriptionPlan.STARTER;for(let e of o)if(e.subscription)if(e.subscription.plan===a.SubscriptionPlan.ENTERPRISE){r=a.SubscriptionPlan.ENTERPRISE;break}else e.subscription.plan===a.SubscriptionPlan.PROFESSIONAL&&r===a.SubscriptionPlan.STARTER&&(r=a.SubscriptionPlan.PROFESSIONAL);let s=l[r],u=null===s.venues||t<s.venues;return u||(i=`You've reached the venue limit for your ${r} plan (${s.venues} venue${1===s.venues?"":"s"}). Upgrade to create more venues.`),{canCreateVenue:u,venuesUsed:t,venuesLimit:s.venues,plan:r,message:i}}async function c(e){let i=await u(e),t=l[i.plan];return{plan:i.plan,venues:{used:i.venuesUsed,limit:i.venuesLimit},features:{bookingsPerMonth:t.bookingsPerMonth,galleryImages:t.galleryImages,analytics:t.analytics,widgets:t.widgets,customBranding:t.customBranding,prioritySupport:t.prioritySupport}}}},46022:(e,i,t)=>{"use strict";t.d(i,{Au:()=>m,FZ:()=>l,Si:()=>p,X5:()=>o,Zq:()=>c,_A:()=>u,nu:()=>s,zK:()=>r});var n=t(66146),a=t(96330);let o=n.z.object({email:n.z.string().email("Invalid email address"),password:n.z.string().min(6,"Password must be at least 6 characters")}),r=n.z.object({email:n.z.string().email("Invalid email address"),password:n.z.string().min(6,"Password must be at least 6 characters"),firstName:n.z.string().min(1,"First name is required"),lastName:n.z.string().min(1,"Last name is required"),phone:n.z.string().optional()}),s=n.z.object({name:n.z.string().min(1,"Venue name is required"),description:n.z.string().optional(),address:n.z.string().min(1,"Address is required"),city:n.z.string().min(1,"City is required"),postcode:n.z.string().min(1,"Postcode is required"),phone:n.z.string().min(1,"Phone is required"),email:n.z.string().email("Invalid email address"),website:n.z.string().url().optional().or(n.z.literal("")),cuisine:n.z.string().optional(),venueType:n.z.nativeEnum(a.VenueType),capacity:n.z.number().min(1,"Capacity must be at least 1")}),l=n.z.object({venueId:n.z.string().min(1,"Venue is required"),serviceType:n.z.nativeEnum(a.ServiceType),date:n.z.string().min(1,"Date is required"),time:n.z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,"Invalid time format"),partySize:n.z.number().min(1,"Party size must be at least 1"),customerName:n.z.string().min(1,"Customer name is required"),customerEmail:n.z.string().email("Invalid email address"),customerPhone:n.z.string().min(1,"Phone number is required"),specialRequests:n.z.string().optional(),tableId:n.z.string().optional()}),u=n.z.object({name:n.z.string().min(1,"Table name is required"),capacity:n.z.number().min(1,"Capacity must be at least 1"),description:n.z.string().optional()});n.z.object({name:n.z.string().min(1,"Event name is required"),description:n.z.string().optional(),date:n.z.string().min(1,"Date is required"),startTime:n.z.string().min(1,"Start time is required"),endTime:n.z.string().min(1,"End time is required"),capacity:n.z.number().min(1,"Capacity must be at least 1"),price:n.z.number().min(0,"Price must be positive").optional()});let c=n.z.object({dayOfWeek:n.z.number().min(0).max(6),openTime:n.z.string().min(1,"Open time is required"),closeTime:n.z.string().min(1,"Close time is required"),isOpen:n.z.boolean()}),d=n.z.object({dayOfWeek:n.z.number().min(0).max(6),openTime:n.z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,"Invalid time format"),closeTime:n.z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,"Invalid time format"),name:n.z.string().optional(),isActive:n.z.boolean().default(!0)}),p=n.z.object({openingHours:n.z.array(d)}),m=n.z.object({name:n.z.string().min(1,"Widget name is required"),settings:n.z.object({theme:n.z.string().optional(),primaryColor:n.z.string().optional(),showLogo:n.z.boolean().optional(),allowedServices:n.z.array(n.z.nativeEnum(a.ServiceType)).optional()}).optional()})},62686:(e,i,t)=>{"use strict";t.d(i,{z:()=>a});var n=t(96330);let a=globalThis.prisma??new n.PrismaClient},67307:()=>{},69609:(e,i,t)=>{"use strict";t.d(i,{q0:()=>o});var n=t(62686),a=t(96330);async function o(e,i,t,o,r,s){let l=i.getDay(),u=await n.z.venueOpeningHours.findMany({where:{venueId:e,dayOfWeek:l,isActive:!0},orderBy:{openTime:"asc"}});if(0===u.length)return{available:!1,reason:"Venue is closed on this day"};let[c,d]=t.split(":").map(Number),p=60*c+d,m=!1;for(let e of u){let[i,t]=e.openTime.split(":").map(Number),[n,a]=e.closeTime.split(":").map(Number),o=60*n+a;if(p>=60*i+t&&p<=o){m=!0;break}}if(!m)return{available:!1,reason:"Time is outside operating hours"};if(r===a.ServiceType.DINE_IN&&s){let e=await n.z.table.findUnique({where:{id:s}});if(!e||!e.isActive)return{available:!1,reason:"Table is not available"};if(e.capacity<o)return{available:!1,reason:"Table capacity is insufficient"};let t=new Date(i);t.setHours(c,d,0,0);let r=new Date(t);for(let e of(r.setHours(r.getHours()+2),await n.z.booking.findMany({where:{tableId:s,date:{gte:new Date(i.toDateString()),lt:new Date(new Date(i.toDateString()).getTime()+864e5)},status:{in:[a.BookingStatus.PENDING,a.BookingStatus.CONFIRMED]}}}))){let i=new Date(e.date),[n,a]=e.time.split(":").map(Number);i.setHours(n,a,0,0);let o=new Date(i);if(o.setMinutes(o.getMinutes()+e.duration),t<o&&r>i)return{available:!1,reason:"Table is already booked for this time"}}}if(r===a.ServiceType.DINE_IN&&!s){let r=await n.z.venue.findUnique({where:{id:e}});if(!r)return{available:!1,reason:"Venue not found"};if((await n.z.booking.findMany({where:{venueId:e,date:{gte:new Date(i.toDateString()),lt:new Date(new Date(i.toDateString()).getTime()+864e5)},time:t,status:{in:[a.BookingStatus.PENDING,a.BookingStatus.CONFIRMED]}}})).reduce((e,i)=>e+i.partySize,0)+o>r.capacity)return{available:!1,reason:"Venue capacity exceeded"}}return{available:!0}}}};