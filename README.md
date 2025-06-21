# Sully Booking System

A comprehensive booking system built with Next.js, featuring appointment scheduling, user management, and seamless deployment capabilities.

## Features

- **Appointment Scheduling**: Easy-to-use booking interface for clients
- **User Management**: Admin dashboard for managing bookings and users
- **Responsive Design**: Mobile-friendly interface built with modern web technologies
- **Real-time Updates**: Dynamic booking availability and notifications
- **Secure Authentication**: User authentication and authorization system

## Tech Stack

- **Frontend**: Next.js, React, TypeScript
- **Styling**: Tailwind CSS
- **Deployment**: Netlify (configured for automatic deployment)
- **Database**: [Add your database solution here]
- **Authentication**: [Add your auth solution here]

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/gcmweb/sully-booking-system-v2.git
cd sully-booking-system-v2
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```
Edit `.env.local` with your configuration values.

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Copy from .env.example and fill in your values
NEXT_PUBLIC_APP_URL=http://localhost:3000
# Add other environment variables as needed
```

## Deployment

### Netlify Deployment

This project is configured for automatic deployment on Netlify:

1. Connect your GitHub repository to Netlify
2. Set the build command: `npm run build`
3. Set the publish directory: `out` or `.next` (depending on your Next.js configuration)
4. Add your environment variables in Netlify's dashboard
5. Deploy!

The repository includes:
- `netlify.toml` - Netlify configuration file
- Build optimization settings
- Redirect rules for SPA routing

### Manual Deployment

```bash
npm run build
npm run export  # if using static export
```

## Project Structure

```
sully-booking-system/
├── components/          # Reusable React components
├── pages/              # Next.js pages
├── public/             # Static assets
├── styles/             # CSS and styling files
├── utils/              # Utility functions
├── .env.example        # Environment variables template
├── netlify.toml        # Netlify configuration
├── next.config.js      # Next.js configuration
└── package.json        # Dependencies and scripts
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run export` - Export static site (if configured)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please open an issue in the GitHub repository.

---

**Ready for Netlify deployment!** 🚀

Connect this repository to Netlify for automatic deployments on every push to the main branch.
