#!/usr/bin/env node

/**
 * Interactive setup guide for deploying Bitespeed Identity Reconciliation
 * Run this to get step-by-step instructions
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
};

const printSection = (title: string) => {
  console.log('\n' + '='.repeat(70));
  console.log(`  ${title}`);
  console.log('='.repeat(70) + '\n');
};

const printStep = (step: number, title: string) => {
  console.log(`\n📌 STEP ${step}: ${title}`);
  console.log('-'.repeat(70));
};

const runSetup = async () => {
  console.clear();
  console.log(`
╔════════════════════════════════════════════════════════════════════╗
║                                                                    ║
║        🚀 Bitespeed Identity Reconciliation Deployment Setup       ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝
  `);

  console.log('This interactive guide will help you deploy your API online.\n');

  // STEP 1: GitHub
  printStep(1, 'Push Code to GitHub');
  console.log(`
Your code is ready to be pushed. Here's what to do:

1. Create a GitHub repository:
   • Go to https://github.com
   • Click "+" → "New repository"
   • Name: "bitespeed-identity-reconciliation"
   • Make it PUBLIC (required for submission)
   • Click "Create repository"

2. Then run these commands in your terminal:

   git remote add origin https://github.com/YOUR_USERNAME/bitespeed-identity-reconciliation.git
   git branch -M main
   git push -u origin main

Replace YOUR_USERNAME with your actual GitHub username.

  `);

  const gitReady = await question('✅ Have you pushed code to GitHub? (yes/no): ');

  if (gitReady.toLowerCase() !== 'yes' && gitReady.toLowerCase() !== 'y') {
    console.log('\n⏸️  Please complete Step 1 first, then run again.');
    rl.close();
    return;
  }

  // STEP 2: PostgreSQL Database
  printStep(2, 'Create Free PostgreSQL Database');
  console.log(`
Choose one service:

OPTION A - Neon (Recommended):
  1. Go to https://neon.tech
  2. Sign up for free
  3. Create a project
  4. Copy the connection string (looks like: postgresql://user:pass@neon.tech/db)
  5. Save it somewhere safe

OPTION B - ElephantSQL:
  1. Go to https://www.elephantsql.com
  2. Click "Get Started"
  3. Create a free instance
  4. Copy the PostgreSQL URL
  5. Save it somewhere safe

  `);

  const dbUrl = await question(
    '📋 Paste your database connection string here:\n> '
  );

  if (!dbUrl.includes('postgresql://')) {
    console.log(
      '\n❌ Invalid database URL. Please make sure it starts with "postgresql://"'
    );
    rl.close();
    return;
  }

  console.log(
    '\n✅ Database URL saved! You\'ll need this for the next step.'
  );

  // STEP 3: Render Deployment
  printStep(3, 'Deploy to Render.com');
  console.log(`
Follow these steps to deploy your API:

1. Go to https://render.com
2. Sign in with GitHub (recommended)
3. Click "New +" → "Web Service"
4. Select your repository "bitespeed-identity-reconciliation"
5. Configure:
   • Name: bitespeed-api
   • Environment: Node
   • Region: Oregon (or closest)
   • Build Command: npm install && npm run build
   • Start Command: npm start
   • Plan: Free

6. Click "Advanced" and add Environment Variables:
   DATABASE_URL = ${dbUrl}
   NODE_ENV = production
   PORT = 3000

7. Click "Create Web Service"
8. Wait 2-5 minutes for deployment
9. You'll see your API URL like: https://bitespeed-api.onrender.com

  `);

  const apiUrl = await question(
    '📋 Paste your Render API URL here (e.g., https://bitespeed-api.onrender.com):\n> '
  );

  if (!apiUrl.includes('https://') || !apiUrl.includes('.')) {
    console.log('\n❌ Invalid URL format.');
    rl.close();
    return;
  }

  console.log('\n✅ API URL saved!');

  // STEP 4: Run Migration
  printStep(4, 'Run Database Migration');
  console.log(`
Now run the database migration:

1. Go to your Render service dashboard
2. Click the "Shell" tab
3. Run this command:
   npm run migrate

4. You should see: "Migration completed successfully"

After running the migration, press Enter to continue.
  `);

  await question('Press Enter when migration is complete: ');

  // STEP 5: Test API
  printStep(5, 'Test Your API');
  console.log(`
Let's test if your API works!

You can test using curl:

curl -X POST ${apiUrl}/identify \\
  -H "Content-Type: application/json" \\
  -d '{"email": "test@example.com", "phoneNumber": "1234567890"}'

Or use Postman:
1. Open Postman
2. Create new POST request
3. URL: ${apiUrl}/identify
4. Body (JSON): {"email": "test@example.com", "phoneNumber": "1234567890"}
5. Send

Expected response:
{
  "contact": {
    "primaryContatctId": 1,
    "emails": ["test@example.com"],
    "phoneNumbers": ["1234567890"],
    "secondaryContactIds": []
  }
}

  `);

  const testDone = await question('✅ Have you tested the API? (yes/no): ');

  if (testDone.toLowerCase() !== 'yes' && testDone.toLowerCase() !== 'y') {
    console.log(
      '\n🔧 Please test your API. If tests fail, check: DATABASE_URL, run migration, check Render logs.'
    );
  }

  // STEP 6: Update README
  printStep(6, 'Update README with Live URL');
  console.log(`
Update your README.md file:

1. Open README.md
2. Find the "## Live Endpoint" section
3. Replace "To be updated after deployment" with:
   
   **Base URL**: ${apiUrl}

4. Save the file
5. Run:
   git add README.md
   git commit -m "Update README with live API endpoint"
   git push

  `);

  const readmeUpdated = await question(
    '✅ Have you updated and pushed README.md? (yes/no): '
  );

  // STEP 7: Final Submission
  printStep(7, 'Submit to Bitespeed');
  console.log(`
You're almost done! Now submit your work:

1. Go to: https://forms.gle/hsQBJQ8tzbsp53D77
2. Fill in these fields:
   
   Repository URL: 
   https://github.com/YOUR_USERNAME/bitespeed-identity-reconciliation

   Live API Endpoint:
   ${apiUrl}/identify

   Additional Notes:
   (optional - leave blank or add notes)

3. Click "Submit"

That's it! You've successfully completed the Bitespeed Backend Task! 🎉

  `);

  // Final Summary
  printSection('✅ DEPLOYMENT COMPLETE');
  console.log(`
Your Bitespeed Identity Reconciliation API is now LIVE! 🚀

📍 GitHub Repository: https://github.com/YOUR_USERNAME/bitespeed-identity-reconciliation
🌐 Live API: ${apiUrl}
📊 Database: Connected and migrated

What's been deployed:
✅ Node.js + TypeScript backend
✅ Express.js REST API
✅ PostgreSQL database
✅ Identity reconciliation logic
✅ /identify endpoint

Next steps:
1. Verify API is working correctly
2. Share with friends to test
3. Submit to Bitespeed form
4. Monitor Render dashboard for performance

Need help?
• Check DEPLOYMENT.md for detailed instructions
• View logs in Render dashboard
• Verify DATABASE_URL in Render environment variables

Thank you for using Bitespeed! 🙏
  `);

  rl.close();
};

runSetup().catch(console.error);
