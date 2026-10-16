import fs from "fs";
import path from "path";
import os from "os";

async function main() {
  const configPath = path.join(os.homedir(), ".config", "configstore", "firebase-tools.json");
  const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
  let accessToken = config.tokens?.access_token;

  if (config.tokens?.refresh_token) {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: "563584335869-fgrhgmd47bqnekij5i8b5pr03ho859e1.apps.googleusercontent.com",
        grant_type: "refresh_token",
        refresh_token: config.tokens.refresh_token
      })
    });
    const tokenData = await tokenRes.json();
    if (tokenData.access_token) accessToken = tokenData.access_token;
  }

  const projectId = "portal-senyum-rekah-f0180";

  // Check lookup by email
  const lookupRes = await fetch(`https://identitytoolkit.googleapis.com/v1/projects/${projectId}/accounts:lookup`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email: ["ratna@senyumrekah.id", "ibnuaqil0912@gmail.com"]
    })
  });

  const lookupData = await lookupRes.json();
  console.log("Lookup result:", JSON.stringify(lookupData, null, 2));

  // Check config
  const configRes = await fetch(`https://identitytoolkit.googleapis.com/v2/projects/${projectId}/config`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  console.log("Config status:", configRes.status);
  const cfg = await configRes.json();
  console.log("SignIn Config:", JSON.stringify(cfg.signIn || {}, null, 2));
}

main().catch(console.error);
