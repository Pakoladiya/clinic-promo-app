# Setup Guide for Clinic Promo App

This guide provides detailed instructions on how to configure Supabase and deploy the frontend for the Clinic Promo App.

## Prerequisites

Before you begin, ensure you have the following:

- A Supabase account
- Node.js installed on your machine
- A preferred code editor (like VSCode)

## Supabase Configuration

1. **Create a New Supabase Project**  
   - Go to [Supabase](https://supabase.io) and sign in.  
   - Click on "New Project" and fill in the required details.  
   - Choose a name for your project and select your preferred database region.

2. **Get the API Keys**  
   - After the project is created, navigate to the "Settings" > "API" section.  
   - Note down the `URL` and `anon` key; you will need these for your frontend configuration.

3. **Database Configuration**  
   - Go to the "Database" tab and set up your database schema as required by the app.  
   - You can use SQL scripts to create tables. Refer to the app documentation for table structures.

4. **Set Up Authentication**  
   - Navigate to the "Authentication" section.  
   - Configure user sign-up options and authentication settings as per the project's requirements.

## Frontend Deployment

1. **Clone the Repository**  
   ```bash  
   git clone https://github.com/Pakoladiya/clinic-promo-app.git  
   cd clinic-promo-app  
   ```

2. **Install Dependencies**  
   ```bash  
   npm install  
   ```

3. **Configure Environment Variables**  
   - Create a `.env` file in the root directory and add the following:  
     ```env  
     VITE_SUPABASE_URL=your_supabase_url  
     VITE_SUPABASE_ANON_KEY=your_anon_key  
     ```

4. **Build the Project**  
   ```bash  
   npm run build  
   ```

5. **Deploy the Project**  
   - You can deploy the build folder to any static hosting service (e.g., Vercel, Netlify).  
   - Follow the specific instructions of the hosting service for deployment.

## Conclusion

You have now configured Supabase and deployed the frontend for the Clinic Promo App. For additional information, refer to the project's documentation or consult the Supabase documentation.