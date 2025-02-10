# BidFlow - RFP Management System

A modern web application for managing Request for Proposals (RFPs) and bids, built with Next.js and deployed on AWS Amplify.

## Features

- User authentication and profile management
- RFP creation and management
- Bid submission and tracking
- Real-time notifications
- Document upload and analysis
- Responsive design

## Tech Stack

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Zustand for state management
- React Hook Form with Zod validation
- AWS Amplify for deployment

## Development

1. Clone the repository:
   ```bash
   git clone https://github.com/Q-Agency/bidding_poc.git
   cd bidding_poc
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment on AWS Amplify

1. Push your code to a Git repository (GitHub, GitLab, or AWS CodeCommit).

2. Log in to the AWS Management Console and go to AWS Amplify.

3. Click "New app" → "Host web app".

4. Connect your repository and select the main branch.

5. Configure build settings:
   - The `amplify.yml` file in the repository will be used for build settings
   - Add environment variables if needed

6. Review and deploy.

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
NEXT_PUBLIC_API_URL=your_api_url
```

For production deployment, add these environment variables in the AWS Amplify Console.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
