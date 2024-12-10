#!/usr/bin/env node

import fs from "fs";
import path from "path";

console.log(`
  =================================
     Welcome to AuthCraft!
  Your Next.js Auth Companion
  =================================
`);

const placeholderPath = path.join(process.cwd(), "auth-placeholder.txt");

fs.writeFileSync(placeholderPath, "This is a placeholder file for AuthCraft.");
console.log(`✅ Placeholder file created at: ${placeholderPath}`);
