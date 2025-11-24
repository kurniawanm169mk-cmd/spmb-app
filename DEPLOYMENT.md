# Deployment Guide: Vercel + GitHub

This guide explains how to deploy your SPMB application to Vercel using GitHub.

## Prerequisites
1.  **GitHub Account**: [Sign up here](https://github.com/).
2.  **Vercel Account**: [Sign up here](https://vercel.com/signup).
3.  **Git Installed**: Ensure Git is installed on your computer.

## Step 1: Push Code to GitHub

1.  **Initialize Git** (if not already done):
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    ```

2.  **Create a New Repository on GitHub**:
    -   Go to GitHub and create a new repository (e.g., `spmb-app`).
    -   Do **not** initialize with README, .gitignore, or License (you already have them).

3.  **Push Code**:
    -   Copy the commands provided by GitHub under "…or push an existing repository from the command line".
    -   Example:
        ```bash
        git remote add origin https://github.com/YOUR_USERNAME/spmb-app.git
        git branch -M main
        git push -u origin main
        ```

## Step 2: Deploy to Vercel

1.  **Import Project**:
    -   Log in to Vercel.
    -   Click **"Add New..."** -> **"Project"**.
    -   Select **"Continue with GitHub"**.
    -   Find your `spmb-app` repository and click **"Import"**.

2.  **Configure Project**:
    -   **Framework Preset**: Vercel should auto-detect `Vite`. If not, select it.
    -   **Root Directory**: `./` (default).

3.  **Environment Variables** (CRITICAL):
    -   Expand the **"Environment Variables"** section.
    -   Add the following variables (copy values from your local `.env` file or Supabase dashboard):
        -   `VITE_SUPABASE_URL`: Your Supabase Project URL.
        -   `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Key.

4.  **Deploy**:
    -   Click **"Deploy"**.
    -   Wait for the build to finish.

## Step 3: Update Supabase Auth Settings

1.  **Get Your Vercel URL**:
    -   Once deployed, Vercel will give you a domain (e.g., `https://spmb-app.vercel.app`).

2.  **Update Supabase**:
    -   Go to your Supabase Dashboard -> **Authentication** -> **URL Configuration**.
    -   Add your Vercel URL to **Site URL** and **Redirect URLs**.
    -   Save changes.

## Step 4: Verify

-   Visit your Vercel URL.
-   Try registering a new student.
-   Try logging in as Admin.

**Done! Your app is live.**
