# Supabase Setup Instructions for Clinic Promo App

## Step 1: Create a Supabase Account
1. Go to [Supabase](https://supabase.com/).
2. Click on "Start your project" and create an account.

## Step 2: Create a New Project
1. Once logged in, click on "New Project."
2. Fill in the required details such as the project name, password, and database region.
3. Click on "Create new project."

## Step 3: Set Up Database Schema
Here is the recommended database schema for the Clinic Promo App:

### 1. Users Table
- **id**: UUID (Primary Key)
- **name**: VARCHAR
- **email**: VARCHAR (Unique)
- **password**: VARCHAR

### 2. Clinics Table
- **id**: UUID (Primary Key)
- **name**: VARCHAR
- **location**: VARCHAR
- **contact_info**: JSON

### 3. Promotions Table
- **id**: UUID (Primary Key)
- **clinic_id**: UUID (Foreign Key)
- **description**: TEXT
- **start_date**: TIMESTAMP
- **end_date**: TIMESTAMP

## Step 4: API Keys
1. Navigate to the settings of your project.
2. Find your API keys under the "API" section.
3. Save the keys securely as they'll be needed to connect your app to Supabase.

## Step 5: Client Library Integration
- Use the Supabase client library in your application to connect with your Supabase backend. Follow the documentation on Supabase's website for integration instructions.


## Conclusion
Once you have completed these steps, your Supabase setup for the Clinic Promo App should be ready for use!