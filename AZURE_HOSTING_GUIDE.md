# Azure App Service Deployment Guide via VS Code

This guide provides the exact step-by-step instructions to deploy **CivicCycle** directly from **VS Code** to **Azure Web App** (without using GitHub).

---

## Pre-requisites

1. **Install the Azure App Service Extension in VS Code**:
   - Open VS Code Extensions tab (`Ctrl + Shift + X`).
   - Search for `Azure App Service` (published by Microsoft) and click **Install**.
2. **Azure Account**:
   - An active Azure subscription (Free Student, Pay-As-You-Go, or Azure Pass).

---

## Step 1: Sign in to Azure in VS Code

1. Click the **Azure icon** (the letter 'A') on the left Activity Bar of VS Code.
2. Click **Sign in to Azure...** and complete the login in your web browser.
3. Once logged in, you will see your Azure subscription listed under **RESOURCES**.

---

## Step 2: Build the Production Frontend

Before deploying, build the optimized production bundle locally:

```bash
npm run build
```

This compiles your React TypeScript code into the `dist/` directory.

---

## Step 3: Create the Web App in Azure (If not already created)

You can create it directly inside VS Code or via the Azure Portal:

### Option A: Inside VS Code
1. In the VS Code Azure sidebar, expand your subscription.
2. Right-click **App Services** $\rightarrow$ Click **Create New Web App... (Advanced)**.
3. Enter the details:
   - **Name**: Enter a unique name (e.g. `civiccycle-prod`, will become `https://civiccycle-prod.azurewebsites.net`).
   - **Resource Group**: Create new (e.g. `rg-civiccycle`).
   - **Runtime stack**: Select **Node 20 LTS**.
   - **OS**: Select **Linux**.
   - **App Service Plan**: Create new (Select **Free (F1)** for testing or **Basic (B1)**).
   - **Application Insights**: Skip for now.

### Option B: In Azure Portal (portal.azure.com)
1. Click **Create a resource** $\rightarrow$ **Web App**.
2. Select your Resource Group.
3. Name: `civiccycle-prod`
4. Publish: **Code**
5. Runtime Stack: **Node 20 LTS**
6. Operating System: **Linux**
7. Pricing Plan: **Free F1** or **Basic B1**
8. Click **Review + create** $\rightarrow$ **Create**.

---

## Step 4: Configure Secure AI Environment Variables

To keep your AI keys encrypted on the server side:

### In VS Code:
1. Under your Web App in the Azure sidebar, expand **Application Settings**.
2. Right-click **Application Settings** $\rightarrow$ **Add New Setting...**.
3. Add these 4 settings:
   - `AZURE_AI_KEY` = `your_azure_openai_key`
   - `AZURE_AI_ENDPOINT` = `https://hanserr-resource.services.ai.azure.com/openai/v1/responses`
   - `AZURE_AI_MODEL` = `gpt-5-nano`
   - `PORT` = `8080`

### Or in Azure Portal:
1. Open your Web App $\rightarrow$ Go to **Configuration** (or **Environment variables**).
2. Add the 4 keys above under **Application settings**.
3. Click **Save** $\rightarrow$ **Continue**.

---

## Step 5: Deploy Directly from VS Code

1. In VS Code, open the **File Explorer** tab (`Ctrl + Shift + E`).
2. Right-click on the project root folder (`fsd-project`) or right-click in an empty area of the Explorer.
3. Click **Deploy to Web App...**.
4. Select your subscription and click on your Web App (e.g. `civiccycle-prod`).
5. A confirmation dialog will appear:
   > *"Are you sure you want to deploy to civiccycle-prod? This will overwrite previous deployments."*
6. Click **Deploy**.

VS Code will package your project (ignoring heavy `node_modules` thanks to `.vscode/settings.json`), upload it to Azure, and start `server.js`.

When deployment finishes (usually 30–60 seconds), click **Browse Website** in the popup notification!
