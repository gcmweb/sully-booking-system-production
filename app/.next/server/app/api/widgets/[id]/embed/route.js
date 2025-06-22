(()=>{var e={};e.id=1687,e.ids=[1687],e.modules={3295:e=>{"use strict";e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},10846:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},29294:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},43331:()=>{},44870:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},62686:(e,t,o)=>{"use strict";o.d(t,{z:()=>i});var r=o(96330);let i=globalThis.prisma??new r.PrismaClient},63033:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},64144:(e,t,o)=>{"use strict";o.r(t),o.d(t,{patchFetch:()=>f,routeModule:()=>c,serverHooks:()=>g,workAsyncStorage:()=>u,workUnitAsyncStorage:()=>p});var r={};o.r(r),o.d(r,{GET:()=>m,dynamic:()=>d});var i=o(54899),s=o(85420),a=o(22403),n=o(44917),l=o(62686);let d="force-dynamic";async function m(e,{params:t}){try{let e=await l.z.bookingWidget.findUnique({where:{id:t.id,isActive:!0},include:{venue:{select:{id:!0,name:!0,isActive:!0}}}});if(!e||!e.venue.isActive)return new n.NextResponse(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Widget Not Found</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            .error { color: #e74c3c; }
          </style>
        </head>
        <body>
          <div class="error">
            <h2>Widget Not Found</h2>
            <p>The booking widget you are looking for is not available.</p>
          </div>
        </body>
        </html>
        `,{status:404,headers:{"Content-Type":"text/html","X-Frame-Options":"ALLOWALL","Access-Control-Allow-Origin":"*"}});let o=e.settings||{},r=o.theme||"light",i=o.primaryColor||"#3b82f6",s=!1!==o.showLogo,a=`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Book at ${e.venue.name}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        html, body {
          height: 100%;
          overflow-x: hidden;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: ${"dark"===r?"#1f2937":"#ffffff"};
          color: ${"dark"===r?"#ffffff":"#1f2937"};
          line-height: 1.6;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        
        .widget-container {
          max-width: 500px;
          width: 100%;
          margin: 0 auto;
          padding: 20px;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          box-sizing: border-box;
        }
        
        .widget-header {
          text-align: center;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid ${"dark"===r?"#374151":"#e5e7eb"};
        }
        
        .widget-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-bottom: 12px;
          font-size: 18px;
          font-weight: bold;
          color: ${i};
        }
        
        .venue-name {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 4px;
        }
        
        .venue-subtitle {
          color: ${"dark"===r?"#9ca3af":"#6b7280"};
          font-size: 14px;
        }
        
        .form-group {
          margin-bottom: 16px;
        }
        
        .form-label {
          display: block;
          margin-bottom: 6px;
          font-weight: 500;
          font-size: 14px;
        }
        
        .form-input, .form-select, .form-textarea {
          width: 100%;
          padding: 12px;
          border: 1px solid ${"dark"===r?"#374151":"#d1d5db"};
          border-radius: 8px;
          background: ${"dark"===r?"#374151":"#ffffff"};
          color: ${"dark"===r?"#ffffff":"#1f2937"};
          font-size: 14px;
          transition: border-color 0.2s;
        }
        
        .form-input:focus, .form-select:focus, .form-textarea:focus {
          outline: none;
          border-color: ${i};
          box-shadow: 0 0 0 3px ${i}20;
        }
        
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        
        .form-row-3 {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 12px;
        }
        
        .submit-btn {
          width: 100%;
          padding: 14px;
          background: ${i};
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .submit-btn:hover {
          background: ${i}dd;
        }
        
        .submit-btn:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }
        
        .success-message {
          background: #10b981;
          color: white;
          padding: 16px;
          border-radius: 8px;
          text-align: center;
          margin-bottom: 20px;
          display: none;
        }
        
        .error-message {
          background: #ef4444;
          color: white;
          padding: 16px;
          border-radius: 8px;
          text-align: center;
          margin-bottom: 20px;
          display: none;
        }
        
        .powered-by {
          text-align: center;
          margin-top: 20px;
          font-size: 12px;
          color: ${"dark"===r?"#9ca3af":"#6b7280"};
        }
        
        .powered-by a {
          color: ${i};
          text-decoration: none;
        }
        
        @media (max-width: 768px) {
          .form-row, .form-row-3 {
            grid-template-columns: 1fr;
          }
          
          .widget-container {
            padding: 16px;
            max-width: 100%;
          }
          
          .form-input, .form-select, .form-textarea {
            font-size: 16px; /* Prevents zoom on iOS */
          }
        }
        
        @media (max-width: 480px) {
          .widget-container {
            padding: 12px;
          }
          
          .widget-header {
            margin-bottom: 20px;
          }
          
          .venue-name {
            font-size: 20px;
          }
        }
      </style>
    </head>
    <body>
      <div class="widget-container">
        <div class="widget-header">
          ${s?`
          <div class="widget-logo">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
            </svg>
            Sully Booking
          </div>
          `:""}
          <div class="venue-name">${e.venue.name}</div>
          <div class="venue-subtitle">Make a reservation</div>
        </div>
        
        <div class="success-message" id="successMessage">
          Booking confirmed! You will receive a confirmation email shortly.
        </div>
        
        <div class="error-message" id="errorMessage">
          Something went wrong. Please try again.
        </div>
        
        <form id="bookingForm">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label" for="customerName">Full Name *</label>
              <input class="form-input" type="text" id="customerName" name="customerName" required>
            </div>
            <div class="form-group">
              <label class="form-label" for="customerEmail">Email *</label>
              <input class="form-input" type="email" id="customerEmail" name="customerEmail" required>
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label" for="customerPhone">Phone Number *</label>
            <input class="form-input" type="tel" id="customerPhone" name="customerPhone" required>
          </div>
          
          <div class="form-row-3">
            <div class="form-group">
              <label class="form-label" for="date">Date *</label>
              <input class="form-input" type="date" id="date" name="date" required>
            </div>
            <div class="form-group">
              <label class="form-label" for="time">Time *</label>
              <select class="form-select" id="time" name="time" required>
                <option value="">Select time</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" for="partySize">Guests *</label>
              <select class="form-select" id="partySize" name="partySize" required>
                <option value="1">1 Guest</option>
                <option value="2" selected>2 Guests</option>
                <option value="3">3 Guests</option>
                <option value="4">4 Guests</option>
                <option value="5">5 Guests</option>
                <option value="6">6 Guests</option>
                <option value="7">7 Guests</option>
                <option value="8">8 Guests</option>
                <option value="9">9 Guests</option>
                <option value="10">10 Guests</option>
              </select>
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label" for="serviceType">Service Type *</label>
            <select class="form-select" id="serviceType" name="serviceType" required>
              <option value="DINE_IN">Dine In</option>
              <option value="TAKEAWAY">Takeaway</option>
              <option value="DELIVERY">Delivery</option>
            </select>
          </div>
          
          <div class="form-group">
            <label class="form-label" for="specialRequests">Special Requests</label>
            <textarea class="form-textarea" id="specialRequests" name="specialRequests" rows="3" placeholder="Any dietary requirements, allergies, or special occasions..."></textarea>
          </div>
          
          <button type="submit" class="submit-btn" id="submitBtn">
            Book Now
          </button>
        </form>
        
        <div class="powered-by">
          Powered by <a href="https://sully-booking.com" target="_blank">Sully Booking</a>
        </div>
      </div>
      
      <script>
        // Set minimum date to tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        document.getElementById('date').min = tomorrow.toISOString().split('T')[0];
        
        // Generate time slots
        const timeSelect = document.getElementById('time');
        for (let hour = 9; hour < 22; hour++) {
          for (let minute of [0, 30]) {
            const timeString = hour.toString().padStart(2, '0') + ':' + minute.toString().padStart(2, '0');
            const option = document.createElement('option');
            option.value = timeString;
            option.textContent = timeString;
            timeSelect.appendChild(option);
          }
        }
        
        // Handle form submission
        document.getElementById('bookingForm').addEventListener('submit', async function(e) {
          e.preventDefault();
          
          const submitBtn = document.getElementById('submitBtn');
          const successMessage = document.getElementById('successMessage');
          const errorMessage = document.getElementById('errorMessage');
          
          // Hide previous messages
          successMessage.style.display = 'none';
          errorMessage.style.display = 'none';
          
          // Disable submit button
          submitBtn.disabled = true;
          submitBtn.textContent = 'Booking...';
          
          // Collect form data
          const formData = new FormData(e.target);
          const bookingData = {
            venueId: '${e.venue.id}',
            customerName: formData.get('customerName'),
            customerEmail: formData.get('customerEmail'),
            customerPhone: formData.get('customerPhone'),
            date: formData.get('date'),
            time: formData.get('time'),
            partySize: parseInt(formData.get('partySize')),
            serviceType: formData.get('serviceType'),
            specialRequests: formData.get('specialRequests') || ''
          };
          
          try {
            const response = await fetch('/api/public/bookings', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(bookingData)
            });
            
            const result = await response.json();
            
            if (response.ok) {
              successMessage.style.display = 'block';
              e.target.reset();
              
              // Scroll to success message
              successMessage.scrollIntoView({ behavior: 'smooth' });
            } else {
              throw new Error(result.error || 'Failed to create booking');
            }
          } catch (error) {
            errorMessage.textContent = error.message;
            errorMessage.style.display = 'block';
            errorMessage.scrollIntoView({ behavior: 'smooth' });
          } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Book Now';
          }
        });
        
        // Auto-resize iframe if embedded
        function resizeIframe() {
          const height = Math.max(
            document.body.scrollHeight,
            document.body.offsetHeight,
            document.documentElement.clientHeight,
            document.documentElement.scrollHeight,
            document.documentElement.offsetHeight
          );
          
          if (window.parent !== window) {
            window.parent.postMessage({ 
              type: 'resize', 
              height: height + 20, // Add some padding
              source: 'sully-booking-widget'
            }, '*');
          }
        }
        
        // Resize on load and form changes
        window.addEventListener('load', () => {
          setTimeout(resizeIframe, 100);
        });
        
        // Resize on form interactions
        document.getElementById('bookingForm').addEventListener('input', () => {
          setTimeout(resizeIframe, 200);
        });
        
        // Resize on form changes (dropdowns, etc.)
        document.getElementById('bookingForm').addEventListener('change', () => {
          setTimeout(resizeIframe, 200);
        });
        
        // Resize when messages are shown/hidden
        const observer = new MutationObserver(() => {
          setTimeout(resizeIframe, 100);
        });
        
        observer.observe(document.getElementById('successMessage'), { 
          attributes: true, 
          attributeFilter: ['style'] 
        });
        
        observer.observe(document.getElementById('errorMessage'), { 
          attributes: true, 
          attributeFilter: ['style'] 
        });
        
        // Periodic resize check
        setInterval(resizeIframe, 1000);
      </script>
    </body>
    </html>
    `;return new n.NextResponse(a,{headers:{"Content-Type":"text/html","X-Frame-Options":"ALLOWALL","Access-Control-Allow-Origin":"*"}})}catch(e){return console.error("Get widget embed error:",e),new n.NextResponse(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Error</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
          .error { color: #e74c3c; }
        </style>
      </head>
      <body>
        <div class="error">
          <h2>Error Loading Widget</h2>
          <p>There was an error loading the booking widget.</p>
        </div>
      </body>
      </html>
      `,{status:500,headers:{"Content-Type":"text/html","X-Frame-Options":"ALLOWALL","Access-Control-Allow-Origin":"*"}})}}let c=new i.AppRouteRouteModule({definition:{kind:s.RouteKind.APP_ROUTE,page:"/api/widgets/[id]/embed/route",pathname:"/api/widgets/[id]/embed",filename:"route",bundlePath:"app/api/widgets/[id]/embed/route"},resolvedPagePath:"/home/ubuntu/sully-booking-system-production/app/app/api/widgets/[id]/embed/route.ts",nextConfigOutput:"",userland:r}),{workAsyncStorage:u,workUnitAsyncStorage:p,serverHooks:g}=c;function f(){return(0,a.patchFetch)({workAsyncStorage:u,workUnitAsyncStorage:p})}},67307:()=>{},96330:e=>{"use strict";e.exports=require("@prisma/client")}};var t=require("../../../../../webpack-runtime.js");t.C(e);var o=e=>t(t.s=e),r=t.X(0,[4055,534],()=>o(64144));module.exports=r})();