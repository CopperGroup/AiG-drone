import { Vercel } from '@vercel/sdk';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { getSession } from './getServerSession';
import User from './models/user.model';
import { Store } from '@/constants/store';
import { Created2 } from '@vercel/sdk/models/createprojectenvop.js';
import { normalizeRepoName } from './utils';

// Read .env.local and parse all environment variables
function getEnvLocalVariables() {
  const envPath = path.resolve(process.cwd(), '.env.local');

  if (!fs.existsSync(envPath)) {
    throw new Error('.env.local file not found');
  }

  const envConfig = dotenv.parse(fs.readFileSync(envPath));

  console.log('✅ Found environment variables:', Object.keys(envConfig));

  return envConfig; // returns { KEY: 'value', ... }
}

export async function createVercelProject() {
  const email = await getSession();
  const user = await User.findOne({ email });

  if (!user.vercelAccessToken) throw new Error('Vercel authentication required');

  const vercel = new Vercel({
    bearerToken: user.vercelAccessToken,
  });

  console.log(vercel.user.getAuthUser());
  const envVariables = getEnvLocalVariables();

  try {
    // 1️⃣ Create the Vercel project
    const projectResponse = await vercel.projects.createProject({
      requestBody: {
        name: normalizeRepoName(Store.name).toLowerCase(),
        framework: 'nextjs',
        gitRepository: {
          repo: normalizeRepoName(Store.name),
          type: 'github',
        },
      },
    });

    console.log(`✅ Project created: ${projectResponse.id}`);

    // 2️⃣ Prepare the environment variables payload
    const envPayload = Object.entries(envVariables).map(([key, value]) => ({
      key,
      value,
      type: 'encrypted', // Most variables should be encrypted
      target: ['production', 'preview'],
    }));

    // 3️⃣ Add environment variables to the Vercel project
    const envResponse = await vercel.projects.createProjectEnv({
      idOrName: projectResponse.id,
      upsert: 'true',
      requestBody: envPayload,
    });

    console.log(`✅ ${(envResponse.created as Created2[]).length} environment variables added.`);

    // 4️⃣ Create the deployment
    await createDeploymentAndAlias(vercel, projectResponse.id, user.githubUsername);
    
    return {
      projectId: projectResponse.id,
      projectName: projectResponse.name,
      projectLink: projectResponse.link
    };
  } catch (error) {
    console.error(
      error instanceof Error ? `❌ Error: ${error.message}` : String(error)
    );
    throw error;
  }
}

// Deployment creation and aliasing function
async function createDeploymentAndAlias(vercel: Vercel, projectId: string, githubUsername: string) {
  try {
    // Create a new deployment
    const createResponse = await vercel.deployments.createDeployment({
      requestBody: {
        name: projectId, // Use project ID or project name
        target: 'production',
        gitSource: {
          type: 'github',
          repo: normalizeRepoName(Store.name),
          ref: 'main',
          org: githubUsername, // Change this to your actual GitHub organization or username
        },
      },
    });

    const deploymentId = createResponse.id;
    console.log(`Deployment created: ID ${deploymentId} and status ${createResponse.status}`);

    // Check deployment status
    let deploymentStatus;
    let deploymentURL;
    do {
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds between checks

      const statusResponse = await vercel.deployments.getDeployment({
        idOrUrl: deploymentId,
        withGitRepoInfo: 'true',
      });

      deploymentStatus = statusResponse.status;
      deploymentURL = statusResponse.url;
      console.log(`Deployment status: ${deploymentStatus}`);
    } while (
      deploymentStatus === 'BUILDING' ||
      deploymentStatus === 'INITIALIZING'
    );

    if (deploymentStatus === 'READY') {
      console.log(`Deployment successful. URL: ${deploymentURL}`);

      const aliasResponse = await vercel.aliases.assignAlias({
        id: deploymentId,
        requestBody: {
          alias: `${normalizeRepoName(Store.name).toLowerCase()}.vercel.app`, // Create an alias for your project
          redirect: null,
        },
      });

      console.log(`Alias created: ${aliasResponse.alias}`);
    } else {
      console.log('Deployment failed or was canceled');
    }
  } catch (error) {
    console.error(
      error instanceof Error ? `Error: ${error.message}` : String(error),
    );
  }
}
