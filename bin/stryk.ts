#!/usr/bin/env node
import fs from "fs";
import path from "path";
import inquirer from "inquirer";
import chalk from "chalk";

// Welcome message
console.log(
  chalk.blue(`
=================================
      Welcome to AuthCraft!
   Your Next.js Auth Companion
=================================
`)
);

// Define the authentication options
const authOptions = [
  { name: chalk.yellow("Supabase Auth"), value: "supabase" },
  { name: chalk.red("Firebase Auth"), value: "firebase" },
  { name: chalk.green("NextAuth.js/Auth.js"), value: "nextjs" },
];

// Function to check if the project is a Next.js project
function isNextJsProject() {
  try {
    const packageJsonPath = path.join(process.cwd(), "package.json");
    if (!fs.existsSync(packageJsonPath)) {
      throw new Error("No package.json found in the current directory.");
    }
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    const dependencies = packageJson.dependencies || {};
    const devDependencies = packageJson.devDependencies || {};
    return "next" in dependencies || "next" in devDependencies;
  } catch (error: any) {
    console.error(chalk.red("Error checking Next.js project:"), error.message);
    return false;
  }
}

// Function to check for the presence of the `app` folder
function hasAppFolder() {
  const rootDir = process.cwd();
  const possiblePaths = [
    path.join(rootDir, "app"), // Default `app` folder in root
    path.join(rootDir, "src", "app"), // `app` folder in `src`
  ];

  // Parse next.config.js for custom source directory (if available)
  const nextConfigPath = path.join(rootDir, "next.config.js");
  if (fs.existsSync(nextConfigPath)) {
    try {
      const nextConfig = require(nextConfigPath);
      if (nextConfig.srcDir) {
        possiblePaths.push(path.join(rootDir, nextConfig.srcDir, "app"));
      }
    } catch (error) {
      console.warn(chalk.yellow("Warning: Unable to parse next.config.js."));
    }
  }

  // Check if any of the possible paths exist and contain valid routing files
  for (const possiblePath of possiblePaths) {
    if (fs.existsSync(possiblePath)) {
      const validFiles = ["page.js", "page.tsx", "layout.js", "layout.tsx"];
      const filesInApp = fs.readdirSync(possiblePath);
      if (filesInApp.some(file => validFiles.includes(file))) {
        return true; // Valid `app` folder found
      }
    }
  }

  console.error(
    chalk.red(
      "No valid `app` folder found. Ensure you are using the Next.js App Router."
    )
  );
  return false;
}

// Prompt the user for authentication choice
async function promptUser() {
  try {
    const answers = await inquirer.prompt([
      {
        type: "list",
        name: "authChoice",
        message: chalk.cyan(
          "Which authentication method would you like to set up?"
        ),
        choices: authOptions,
      },
    ]);

    // Extract user choice
    const selectedAuth = answers.authChoice;

    if (selectedAuth === "nextjs") {
      // Check if it's a Next.js project
      if (!isNextJsProject()) {
        console.error(
          chalk.red(
            "❌ This script must be run in a Next.js project to set up NextAuth.js/Auth.js."
          )
        );
        return;
      }

      // Check if the project has an `app` folder
      if (!hasAppFolder()) {
        console.error(
          chalk.red(
            "❌ No `app` folder found. This package is only compatible with Next.js App Router."
          )
        );
        return;
      }
    }

    // Write the choice into a placeholder file
    const placeholderPath = path.join(process.cwd(), "auth-placeholder.txt");
    fs.writeFileSync(
      placeholderPath,
      `Authentication method selected: ${selectedAuth}`
    );

    console.log(
      chalk.green("✅ Placeholder file created at: ") +
        chalk.bold(placeholderPath)
    );
  } catch (error) {
    console.error(
      chalk.red("An error occurred while initializing AuthCraft:"),
      error
    );
  }
}

// Call the prompt
promptUser();
