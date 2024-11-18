(async function modifyDescription() {
  const targetSelector = ".remarks"; // Adjust based on website structure
  const processedElements = new Set(); // Track processed elements to avoid re-processing

  // Function to call OpenAI API
  async function analyzeListing(originalText) {
    const apiKey = ""; // Replace with your API key
    const prompt = `Analyze the following real estate listing and extract only notable items worth researching or being aware of, such as potential issues (e.g., old roof, zoning restrictions, 'as-is' sale terms), unique features (e.g., historic designation, special zoning), or anything that might not be obvious from photos. Exclude all general descriptions of the house. Return your output as valid HTML wrapped in appropriate tags, such as <ul> and <li> for lists.\n\n"${originalText}"`;
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7, // Adjust creativity level
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.choices[0].message.content
        .trim()
        .replace(/^```html/, "") // Remove opening backticks if present
        .replace(/```$/, ""); // Remove closing backticks if present
    } else {
      console.error(
        "Error with OpenAI API:",
        response.status,
        response.statusText
      );
      return null;
    }
  }
  // MutationObserver to watch for dynamically loaded content
  const observer = new MutationObserver(async () => {
    const descriptions = document.querySelectorAll(targetSelector);

    for (const description of descriptions) {
      // Skip elements already processed
      if (processedElements.has(description)) continue;

      processedElements.add(description); // Mark as processed

      const originalText = description.textContent.trim();

      if (originalText) {
        // Call OpenAI API once for each element
        const notableItems = await analyzeListing(originalText);

        if (notableItems) {
          description.innerHTML = notableItems; // Replace with notable items
        }
      }
    }
  });

  // Observe the whole document for changes
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
})();
