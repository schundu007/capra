/**
 * Eraser.io API Integration for Architecture Diagrams
 *
 * Requires ERASER_API_KEY environment variable
 * API Documentation: https://docs.eraser.io/docs/api
 */

// Get API key from environment
function getApiKey() {
  return process.env.ERASER_API_KEY;
}

/**
 * Generate a professional architecture diagram using Eraser.io
 * @param {string} description - Text description of the system architecture
 * @returns {Promise<{imageUrl: string, editUrl: string}>} - URLs for the generated diagram
 */
export async function generateDiagram(description) {
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new Error('ERASER_API_KEY not configured. Add it to your .env file.');
  }

  try {
    const response = await fetch('https://app.eraser.io/api/render/prompt', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: description,
        diagramType: 'cloud-architecture-diagram',
        background: true,
        theme: 'light',
        scale: '2'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Eraser API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    return {
      imageUrl: data.imageUrl,
      editUrl: data.createEraserFileUrl || data.editUrl
    };
  } catch (error) {
    console.error('Eraser diagram generation failed:', error);
    throw error;
  }
}

/**
 * Check if Eraser API is configured
 * @returns {boolean}
 */
export function isConfigured() {
  return !!getApiKey();
}
