#!/usr/bin/env node
import fs from "fs";
import path from "path";
import inquirer from "inquirer";
import chalk from "chalk";
import { execSync } from "child_process";

// Utility to check and install next-auth if not installed
function ensureNextAuthInstalled() {
  const rootDir = process.cwd();
  const packageJsonPath = path.join(rootDir, "package.json");

  if (!fs.existsSync(packageJsonPath)) {
    console.error(
      chalk.red("No package.json found. Are you in a Node.js project?")
    );
    process.exit(1);
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
  const isNextAuthInstalled =
    packageJson.dependencies?.["next-auth"] ||
    packageJson.devDependencies?.["next-auth"];

  if (isNextAuthInstalled) {
    console.log(chalk.green("next-auth is already installed."));
  } else {
    console.log(chalk.yellow("next-auth is not installed. Installing now..."));
    try {
      execSync("npm install next-auth", { stdio: "inherit" });
      console.log(chalk.green("next-auth has been successfully installed."));
    } catch (error) {
      console.error(
        chalk.red("Failed to install next-auth. Please try manually.")
      );
      process.exit(1);
    }
  }
}

// Utility to ensure a directory exists, creating it if necessary
function ensureDirectoryExists(directoryPath: string) {
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath, { recursive: true });
    console.log(chalk.green(`Created directory: ${directoryPath}`));
  } else {
    console.log(chalk.blue(`Directory already exists: ${directoryPath}`));
  }
}

// Utility to ensure a file exists, creating it if necessary
function ensureFileExists(filePath: string, content = "") {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content);
    console.log(chalk.green(`Created file: ${filePath}`));
  } else {
    console.log(chalk.blue(`File already exists: ${filePath}`));
  }
}

// Check if the current project is a Next.js project
function isNextJsProject() {
  const rootDir = process.cwd();
  return (
    fs.existsSync(path.join(rootDir, "package.json")) &&
    JSON.parse(fs.readFileSync(path.join(rootDir, "package.json"), "utf-8"))
      .dependencies?.next
  );
}

// Check for the presence of the App Router folder
function hasAppFolder() {
  const rootDir = process.cwd();
  const appFolderPaths = [
    path.join(rootDir, "app"),
    path.join(rootDir, "src", "app"),
  ];
  for (const appPath of appFolderPaths) {
    if (fs.existsSync(appPath)) {
      return appPath;
    }
  }
  console.error(
    chalk.red(
      "App directory not found. Ensure this is a Next.js project using the App Router."
    )
  );
  return null;
}

// Welcome message
console.log(
  chalk.blue(
    `\n=================================\n      Welcome to Stryk!\n   Your Next.js Auth Companion\n=================================\n`
  )
);

// Define authentication options
const authOptions = [
  { name: chalk.yellow("Supabase Auth"), value: "supabase" },
  { name: chalk.red("Firebase Auth"), value: "firebase" },
  { name: chalk.green("NextAuth.js/Auth.js"), value: "nextjs" },
];

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

    const selectedAuth = answers.authChoice;

    if (selectedAuth === "nextjs") {
      // Ensure it's a Next.js project
      if (!isNextJsProject()) {
        console.error(
          chalk.red("This does not appear to be a Next.js project.")
        );
        return;
      }

      // Ensure next-auth is installed
      ensureNextAuthInstalled();

      // Check for app directory
      const appDir = hasAppFolder();
      if (!appDir) return;

      // Create or utilize the API directory
      const apiDir = path.join(appDir, "api");
      ensureDirectoryExists(apiDir);

      // Create or utilize the auth directory
      const authDir = path.join(apiDir, "auth");
      ensureDirectoryExists(authDir);

      // Create or utilize the [...nextauth] directory
      const nextAuthDir = path.join(authDir, "[...nextauth]");
      ensureDirectoryExists(nextAuthDir);

      // Create or utilize the route.ts file
      const routeFilePath = path.join(nextAuthDir, "route.ts");
      ensureFileExists(
        routeFilePath,
        `import NextAuth from "next-auth";\n\nconst handler = NextAuth({\n  // Configure your NextAuth options here\n});\n\nexport { handler as GET, handler as POST };`
      );
    } else {
      // Default behavior for other auth types
      const placeholderPath = path.join(process.cwd(), "auth-placeholder.txt");
      fs.writeFileSync(
        placeholderPath,
        `Authentication method selected: ${selectedAuth}`
      );
      console.log(
        chalk.green("✅ Placeholder file created at: ") +
          chalk.bold(placeholderPath)
      );
    }
  } catch (error) {
    console.error(
      chalk.red("An error occurred while initializing Stryk:"),
      error
    );
  }
}

// Call the prompt
promptUser();
