/**
 * Utility to generate website screenshot URLs using Microlink API.
 * This replaces thum.io which has strict limits and outputs paid account error images.
 */
export function getScreenshotUrl(
  url: string,
  options?: { width?: number; height?: number; isMobile?: boolean }
): string {
  try {
    const cleanUrl = url.trim();
    
    // Setup URL parameters for Microlink API
    const params = new URLSearchParams({
      url: cleanUrl,
      screenshot: "true",
      embed: "screenshot.url",
    });

    if (options?.width) {
      params.append("viewport.width", String(options.width));
    }
    if (options?.height) {
      params.append("viewport.height", String(options.height));
    }
    if (options?.isMobile) {
      params.append("viewport.isMobile", "true");
    }

    return `https://api.microlink.io/?${params.toString()}`;
  } catch {
    return url;
  }
}
