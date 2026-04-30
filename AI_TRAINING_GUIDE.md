# AI Assistant Training Guide

## Overview
Your LogiFlow AI assistant can be trained through multiple approaches. Currently, it uses a hybrid system combining pattern matching, knowledge base responses, and optional OpenAI integration.

## Current Training Methods

### 1. **Pattern-Based Responses** (Active)
The AI recognizes common logistics questions using regex patterns:

```javascript
// In backend/src/chat.js - KNOWLEDGE_BASE
const KNOWLEDGE_BASE = {
  services: {
    patterns: [/what.*services?|what.*do.*you.*offer?|services/i],
    response: "We offer comprehensive logistics services including..."
  },
  pricing: {
    patterns: [/how.*much|cost|price|fee|charge/i],
    response: "Our pricing depends on several factors..."
  }
  // Add more patterns here
};
```

**To train:** Add new patterns and responses to the `KNOWLEDGE_BASE` object.

### 2. **OpenAI Integration** (Optional)
For more intelligent responses, add your OpenAI API key:

```bash
# In .env file
OPENAI_API_KEY=sk-your-api-key-here
OPENAI_MODEL=gpt-3.5-turbo
```

The AI will use GPT with a custom system prompt about your logistics company.

### 3. **Tracking Query Enhancement**
The AI automatically handles tracking queries by:
- Extracting tracking numbers with multiple patterns
- Querying the database for shipment status
- Formatting responses with shipment details and history

## How to Train Your AI

### Method 1: Add Knowledge Base Entries

1. **Open** `backend/src/chat.js`
2. **Find** the `KNOWLEDGE_BASE` object
3. **Add** new entries:

```javascript
customs: {
  patterns: [/customs|clearance|import|export/i],
  response: "We handle all customs clearance for international shipments. Our team ensures compliance with all regulations and minimizes delays."
},
insurance: {
  patterns: [/insurance|coverage|damage|loss/i],
  response: "We offer comprehensive cargo insurance options. Coverage includes loss, damage, and theft during transit."
}
```

### Method 2: Improve Tracking Patterns

Add more tracking number formats to the `trackingPatterns` array:

```javascript
const trackingPatterns = [
  /(?:TRK-|tracking.*number.*)?([A-Z0-9\-]{6,})/i,
  /(?:order.*number|shipment.*id).?([A-Z0-9\-]{6,})/i,
  /([A-Z]{3}-[A-Z0-9\-]{6,})/i,
  // Add your custom format here
  /(?:REF-|reference).?([A-Z0-9\-]{6,})/i
];
```

### Method 3: Custom System Prompts (OpenAI)

Modify the `systemPrompt` in `handleOpenAIQuery()` to include:
- Specific company policies
- Common customer questions
- Preferred response styles
- Escalation guidelines

### Method 4: Add Escalation Rules

Enhance the `shouldEscalate()` function to detect when to hand off to humans:

```javascript
// Add more escalation triggers
const escalationKeywords = /(?:agent|human|representative|manager|escalate|speak to|urgent|emergency)/i;
const negativeKeywords = /(?:complaint|problem|issue|wrong|damaged|lost)/i;
```

## Testing Your Training

### Test Commands

```bash
# Test tracking
curl -X POST http://localhost:8080/chat/message \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"test","message":"What is the status of DEMO-TRACK-001?"}'

# Test knowledge base
curl -X POST http://localhost:8080/chat/message \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"test","message":"What services do you offer?"}'

# Test escalation
curl -X POST http://localhost:8080/chat/message \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"test","message":"I need to speak to a human"}'
```

### Frontend Testing
1. Open `http://localhost:5173`
2. Click the chat widget (💬)
3. Test various questions and tracking queries

## Advanced Training Options

### 1. **Fine-tune OpenAI Model**
- Collect chat logs from real conversations
- Create a fine-tuning dataset
- Train a custom GPT model specific to logistics

### 2. **Implement Dialogflow**
- Create intents for common logistics queries
- Train with real customer conversations
- Integrate webhook for database queries

### 3. **Add Context Awareness**
- Remember previous conversation topics
- Provide personalized responses based on user history
- Track user preferences and common questions

### 4. **Analytics & Improvement**
- Log all conversations for analysis
- Identify common unhandled questions
- Continuously improve response accuracy

## Best Practices

1. **Start Simple**: Begin with pattern matching before adding AI
2. **Test Thoroughly**: Try various phrasings of the same question
3. **Monitor Performance**: Track which responses work well
4. **Regular Updates**: Add new patterns as you discover common questions
5. **Fallback Gracefully**: Always have a default response for unrecognized queries

## Current Capabilities

✅ **Tracking queries** - Extracts and looks up tracking numbers
✅ **Service information** - Answers common questions about logistics
✅ **Escalation detection** - Identifies when to connect to humans
✅ **OpenAI integration** - Optional intelligent responses
✅ **Database integration** - Real-time shipment data access
✅ **Chat persistence** - Saves conversation history

## Next Steps

1. Add your OpenAI API key to enable intelligent responses
2. Expand the knowledge base with your specific services
3. Test with real customer scenarios
4. Monitor and improve based on actual usage