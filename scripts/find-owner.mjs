import fs from "fs";
import path from "path";
import os from "os";

async function main() {
  const configPath = path.join(os.homedir(), ".config", "configstore", "firebase-tools.json");
  const configRaw = fs.readFileSync(configPath, "utf-8");
  const config = JSON.parse(configRaw);

  const tokens = config.tokens;
  const user = config.user;
  console.log("Logged in Firebase user:", user?.email);

  // Refresh token if needed
  let accessToken = tokens?.access_token;
  const refreshToken = tokens?.refresh_token;

  if (refreshToken) {
    // Get fresh access token from google oauth2
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: "563584335869-fgrhgmd47bqnekij5i8b5pr03ho859e1.apps.googleusercontent.com",
        grant_type: "refresh_token",
        refresh_token: refreshToken
      })
    });
    const tokenData = await tokenRes.json();
    if (tokenData.access_token) {
      accessToken = tokenData.access_token;
      console.log("Successfully refreshed access token.");
    }
  }

  // Query Firebase Auth accounts for project portal-senyum-rekah-f0180
  const projectId = "portal-senyum-rekah-f0180";
  const listRes = await fetch(`https://identitytoolkit.googleapis.com/v1/projects/${projectId}/accounts:batchGet?maxResults=100`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  console.log("Response status:", listRes.status);
  const listData = await listRes.json();
  console.log("Firebase Auth accounts:", JSON.stringify(listData, null, 2));
}

main().catch(console.error);
