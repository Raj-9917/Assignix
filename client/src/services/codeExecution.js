import axios from 'axios';

const API_URL = import.meta.env.VITE_ONECOMPILER_API_URL || 'https://onecompiler-apis.p.rapidapi.com/api/v1/run';
const API_KEY = import.meta.env.VITE_RAPIDAPI_KEY;
const API_HOST = import.meta.env.VITE_RAPIDAPI_HOST || 'onecompiler-apis.p.rapidapi.com';

const headers = {
  'content-type': 'application/json',
  'X-RapidAPI-Key': API_KEY,
  'X-RapidAPI-Host': API_HOST,
};

/**
 * Executes a code snippet on OneCompiler via RapidAPI.
 */
export const executeCode = async (code, language, stdin = '') => {
  // OneCompiler uses string identifiers for languages
  const languageId = language.toLowerCase();

  if (API_KEY === 'REPLACE_WITH_YOUR_RAPIDAPI_KEY' || !API_KEY) {
    return {
      success: false,
      stdout: '',
      stderr: 'RapidAPI Key Not Found! \n\nPlease add your X-RapidAPI-Key to the .env file to enable live code execution.',
      exitCode: -1,
      status: { description: 'Configuration Error' }
    };
  }

  try {
    const response = await axios.post(
      API_URL,
      {
        language: languageId,
        stdin: stdin,
        files: [
          {
            name: `index.${getFileExtension(languageId)}`,
            content: code,
          },
        ],
      },
      { headers }
    );

    const data = response.data;

    // OneCompiler direct response mapping
    return {
      success: data.status === 'success',
      stdout: data.stdout || '',
      stderr: data.stderr || data.exception || '',
      exitCode: data.status === 'success' ? 0 : 1,
      status: { 
        description: data.status === 'success' ? 'Accepted' : (data.exception ? 'Runtime Error' : 'Rejected') 
      },
      time: (data.executionTime / 1000).toFixed(3), // convert ms to s for consistency with UI
      memory: 'N/A', // OneCompiler doesn't typically provide memory usage
    };

  } catch (error) {
    console.error('OneCompiler execution failed:', error);
    return {
      success: false,
      stdout: '',
      stderr: error.response?.data?.message || error.message || 'Submission failed.',
      exitCode: -1,
      status: { description: 'API Error' }
    };
  }
};

/**
 * Helper to get file extension based on language
 */
const getFileExtension = (language) => {
  switch (language) {
    case 'python': return 'py';
    case 'javascript': return 'js';
    case 'java': return 'java';
    case 'cpp': return 'cpp';
    case 'c': return 'c';
    default: return 'txt';
  }
};

const codeExecutionService = {
  executeCode,
};

export default codeExecutionService;
