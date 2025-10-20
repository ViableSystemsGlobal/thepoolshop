const fs = require('fs');
const path = require('path');

console.log('🔍 DEBUGGING UPLOADS...');

// Check current working directory
console.log('Current working directory:', process.cwd());

// Check if /app/uploads exists
const appUploads = '/app/uploads';
console.log(`\n📁 Checking ${appUploads}:`);
console.log('Exists:', fs.existsSync(appUploads));
if (fs.existsSync(appUploads)) {
  console.log('Is directory:', fs.statSync(appUploads).isDirectory());
  console.log('Permissions:', fs.statSync(appUploads).mode.toString(8));
  console.log('Contents:', fs.readdirSync(appUploads));
}

// Check if /app/uploads/branding exists
const brandingDir = '/app/uploads/branding';
console.log(`\n📁 Checking ${brandingDir}:`);
console.log('Exists:', fs.existsSync(brandingDir));
if (fs.existsSync(brandingDir)) {
  console.log('Is directory:', fs.statSync(brandingDir).isDirectory());
  console.log('Permissions:', fs.statSync(brandingDir).mode.toString(8));
  console.log('Contents:', fs.readdirSync(brandingDir));
}

// Try to create the directory
console.log('\n🔧 Attempting to create /app/uploads/branding...');
try {
  if (!fs.existsSync(brandingDir)) {
    fs.mkdirSync(brandingDir, { recursive: true });
    console.log('✅ Directory created successfully');
  } else {
    console.log('✅ Directory already exists');
  }
  
  // Check permissions
  const stats = fs.statSync(brandingDir);
  console.log('Directory permissions:', stats.mode.toString(8));
  console.log('Directory owner:', stats.uid, stats.gid);
  
} catch (error) {
  console.error('❌ Failed to create directory:', error.message);
  console.error('Error code:', error.code);
}

// Try to write a test file
console.log('\n📝 Attempting to write test file...');
try {
  const testFile = path.join(brandingDir, 'test.txt');
  fs.writeFileSync(testFile, 'test content');
  console.log('✅ Test file written successfully');
  
  // Check if file exists
  if (fs.existsSync(testFile)) {
    console.log('✅ Test file exists and is readable');
    const content = fs.readFileSync(testFile, 'utf8');
    console.log('File content:', content);
  } else {
    console.log('❌ Test file was not created');
  }
} catch (error) {
  console.error('❌ Failed to write test file:', error.message);
  console.error('Error code:', error.code);
}

console.log('\n🎉 Debug complete!');
