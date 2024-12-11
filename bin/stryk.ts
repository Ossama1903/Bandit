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
    return "next" in dependencies;
  } catch (error: any) {
    console.error(chalk.red("Error checking Next.js project:"), error.message);
    return false;
  }
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
