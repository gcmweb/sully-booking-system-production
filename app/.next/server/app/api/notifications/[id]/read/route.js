(()=>{var e={};e.id=4207,e.ids=[4207],e.modules={3295:e=>{"use strict";e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},4545:(e,t,o)=>{"use strict";o.r(t),o.d(t,{patchFetch:()=>h,routeModule:()=>f,serverHooks:()=>y,workAsyncStorage:()=>g,workUnitAsyncStorage:()=>m});var r={};o.r(r),o.d(r,{PUT:()=>p,dynamic:()=>d});var n=o(54899),i=o(85420),s=o(22403),a=o(44917),u=o(62258),c=o(36242),l=o(62686);let d="force-dynamic";async function p(e,{params:t}){try{let e=await (0,u.oC)(),o=await l.z.notification.findUnique({where:{id:t.id}});if(!o||o.userId!==e.id)return a.NextResponse.json({error:"Notification not found"},{status:404});return await (0,c.bA)(t.id),a.NextResponse.json({success:!0})}catch(e){return console.error("Mark notification as read error:",e),a.NextResponse.json({error:"Failed to mark notification as read"},{status:500})}}let f=new n.AppRouteRouteModule({definition:{kind:i.RouteKind.APP_ROUTE,page:"/api/notifications/[id]/read/route",pathname:"/api/notifications/[id]/read",filename:"route",bundlePath:"app/api/notifications/[id]/read/route"},resolvedPagePath:"/home/ubuntu/sully-booking-system-production/app/app/api/notifications/[id]/read/route.ts",nextConfigOutput:"",userland:r}),{workAsyncStorage:g,workUnitAsyncStorage:m,serverHooks:y}=f;function h(){return(0,s.patchFetch)({workAsyncStorage:g,workUnitAsyncStorage:m})}},10846:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},27910:e=>{"use strict";e.exports=require("stream")},28354:e=>{"use strict";e.exports=require("util")},29294:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},36242:(e,t,o)=>{"use strict";o.d(t,{LO:()=>n,Ss:()=>a,UI:()=>i,bA:()=>s});var r=o(62686);async function n(e,t){try{let o=function(e){let t=function(e){switch(e){case"DINE_IN":return"Dine In";case"TAKEAWAY":return"Takeaway";case"DELIVERY":return"Delivery";case"EVENT":return"Event";default:return e}}(e.serviceType);return{html:`
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
              <span>${t}</span>
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
    - Service Type: ${t}
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
  `}}(t);console.log("Booking confirmation email would be sent to:",e),console.log("Email content:",o),await r.z.emailTemplate.upsert({where:{name:"booking_confirmation"},update:{},create:{name:"booking_confirmation",subject:"Booking Confirmation - {{venueName}}",htmlBody:o.html,textBody:o.text,isActive:!0}})}catch(e){console.error("Failed to send booking confirmation email:",e)}}async function i(e,t,o,n,i){try{await r.z.notification.create({data:{userId:e,type:t,title:o,message:n,metadata:i||{}}})}catch(e){console.error("Failed to create notification:",e)}}async function s(e){try{await r.z.notification.update({where:{id:e},data:{isRead:!0}})}catch(e){console.error("Failed to mark notification as read:",e)}}async function a(e,t=10){try{return await r.z.notification.findMany({where:{userId:e},orderBy:{createdAt:"desc"},take:t})}catch(e){return console.error("Failed to get user notifications:",e),[]}}},43331:()=>{},44870:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},55511:e=>{"use strict";e.exports=require("crypto")},62258:(e,t,o)=>{"use strict";o.d(t,{BE:()=>d,Er:()=>l,Ht:()=>f,jw:()=>p,l4:()=>m,oC:()=>g});var r=o(29657),n=o.n(r),i=o(3197),s=o.n(i),a=o(24883),u=o(62686);let c=process.env.JWT_SECRET||"sully-booking-system-secret-key";async function l(e){return n().hash(e,12)}async function d(e,t){return n().compare(e,t)}async function p(e){var t;let o=(t={userId:e},s().sign(t,c,{expiresIn:"7d"})),r=new Date;return r.setDate(r.getDate()+7),await u.z.userSession.create({data:{userId:e,token:o,expiresAt:r}}),o}async function f(){console.log("\uD83D\uDD35 [AUTH-LIB] Getting session");try{let e=(0,a.UL)(),t=e.get("auth-token")?.value;if(console.log("\uD83D\uDD35 [AUTH-LIB] Token from cookies:",t?`Token found (${t.substring(0,20)}...)`:"No token found"),!t)return console.log("\uD83D\uDD35 [AUTH-LIB] No auth token found in cookies"),null;console.log("\uD83D\uDD35 [AUTH-LIB] Looking up session in database");let o=await u.z.userSession.findUnique({where:{token:t},include:{user:!0}});if(!o)return console.log("\uD83D\uDD34 [AUTH-LIB] No session found in database for token"),null;if(console.log("\uD83D\uDD35 [AUTH-LIB] Session found, checking expiration"),o.expiresAt<new Date)return console.log("\uD83D\uDD34 [AUTH-LIB] Session expired, deleting"),await u.z.userSession.delete({where:{id:o.id}}),null;return console.log("\uD83D\uDFE2 [AUTH-LIB] Valid session found for user:",o.user.email),{id:o.user.id,email:o.user.email,firstName:o.user.firstName,lastName:o.user.lastName,role:o.user.role,isActive:o.user.isActive}}catch(e){return console.error("\uD83D\uDD34 [AUTH-LIB] Session error:",e),console.error("\uD83D\uDD34 [AUTH-LIB] Error stack:",e?.stack),null}}async function g(e){let t=await f();if(!t)throw Error("Authentication required");if(!t.isActive)throw Error("Account is inactive");if(e&&!e.includes(t.role))throw Error("Insufficient permissions");return t}async function m(e){try{let t=e.cookies.get("auth-token")?.value;if(!t)return null;let o=await u.z.userSession.findUnique({where:{token:t},include:{user:!0}});if(!o)return null;if(o.expiresAt<new Date)return await u.z.userSession.delete({where:{id:o.id}}),null;if(!o.user.isActive)return null;return{id:o.user.id,email:o.user.email,firstName:o.user.firstName,lastName:o.user.lastName,role:o.user.role,isActive:o.user.isActive}}catch(e){return console.error("Error getting user from token:",e),null}}},62686:(e,t,o)=>{"use strict";o.d(t,{z:()=>n});var r=o(96330);let n=globalThis.prisma??new r.PrismaClient},63033:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},67307:()=>{},79428:e=>{"use strict";e.exports=require("buffer")},96330:e=>{"use strict";e.exports=require("@prisma/client")}};var t=require("../../../../../webpack-runtime.js");t.C(e);var o=e=>t(t.s=e),r=t.X(0,[4055,534,6823],()=>o(4545));module.exports=r})();