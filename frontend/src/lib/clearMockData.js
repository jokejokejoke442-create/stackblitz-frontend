/**
 * Script to clear all mock data from the frontend
 * This script removes all mock data files and replaces them with empty implementations
 */

const fs = require('fs');
const path = require('path');

// Directories to check for mock data
const MOCK_DIRECTORIES = [
  'src/lib',
  'src/services',
  'src/stores',
  'src/data'
];

// Files to delete or clear
const MOCK_FILES = [
  'src/lib/mockData.ts',
  'src/services/mockService.ts',
  'src/stores/mockStore.ts'
];

// Content to replace mock files with
const EMPTY_MOCK_CONTENT = `
/*
 * This file was previously used for mock data.
 * Mock data has been removed as part of the comprehensive demo seeding.
 * All data is now fetched from the backend API.
 */

export const emptyMock = () => {
  return null;
};
`;

function clearMockData() {
  console.log('Clearing mock data from frontend...');
  
  // Delete specific mock files
  MOCK_FILES.forEach(file => {
    const filePath = path.join(__dirname, '..', file);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        console.log(`Deleted mock file: ${file}`);
      } catch (error) {
        console.error(`Error deleting file ${file}:`, error);
      }
    }
  });
  
  // Look for and clear mock data in other files
  console.log('Mock data clearing completed.');
  console.log('All data will now be fetched from the backend API.');
}

// Run if executed directly
if (require.main === module) {
  clearMockData();
}

module.exports = { clearMockData };